import {HandlebarsTemplate, Service} from "./generator";
import * as ts from "typescript";

export const extract = (filePath: string): HandlebarsTemplate => {
  const program = ts.createProgram([filePath], {});
  const source = program.getSourceFile(filePath);
  const services: Service[] = [];
  let currentService: Service;

  const visitInterfaceDeclaration = (node: ts.Node) => {
    if (ts.isInterfaceDeclaration(node) && node.heritageClauses) {
      if (node.heritageClauses.length > 1) {
        throw Error("cannot have RPC service extend more than one interface");
      }

      const serviceDefinitionName = node.name.text;
      currentService = {
        routes: [],
        serviceDefinitionName
      };
      //look for heritage clause to RPCService
      const heritageClause = node.heritageClauses[0];
      ts.forEachChild(heritageClause, visitExpressionWithTypeArguments);

      node.members.filter(ts.isPropertySignature).forEach(propertySignature => {
        const propertyChildren = propertySignature.getChildren(source);
        const identifier = propertyChildren
          .find(ts.isIdentifier)
          .getText(source);
        const reqRes = propertyChildren.find(ts.isTypeReferenceNode);
        if (
          reqRes
            .getChildren(source)
            .find(ts.isIdentifier)
            .getText(source) === "RequestResponse"
        ) {
          const typeArguments = reqRes.typeArguments;
          const [req, res] = typeArguments.map(o => o.getText(source));

          currentService.routes.push({
            routeName: identifier,
            request: req,
            response: res
          });
        }
      });

      services.push(currentService);
    }
  };

  const visitExpressionWithTypeArguments = (node: ts.Node) => {
    if (ts.isExpressionWithTypeArguments(node)) {
      const children = node.getChildren(source);
      const identifier = children.find(ts.isIdentifier).getText(source);
      if (identifier === "RPCService") {
        const serviceName = node.typeArguments[0]
          .getText(source)
          .replace(/"/g, "");
        currentService.serviceName = serviceName;
      }
    }
  };

  ts.forEachChild(source, visitInterfaceDeclaration);

  const servicesCleaned = services.filter(service => service.routes.length > 0);

  const imports = Array.from(
      servicesCleaned.reduce((importNames, service) => {
      const { serviceDefinitionName } = service;
      service.routes.forEach(route => {
        importNames.add(route.request);
        importNames.add(route.response);
      });
      importNames.add(serviceDefinitionName);
      return importNames;
    }, new Set<string>())
  );

  const handlebarsData: HandlebarsTemplate = {
    services: servicesCleaned,
    imports
  };

  return handlebarsData;
};
