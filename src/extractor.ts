import { HandlebarsTemplate, Service } from "./generator";
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
        const propertyChildren = propertySignature.getChildren();
        const identifier = propertyChildren.find(ts.isIdentifier).getText();
        const reqRes = propertyChildren.find(ts.isTypeReferenceNode);
        if (
          reqRes
            .getChildren()
            .find(ts.isIdentifier)
            .getText() === "RequestResponse"
        ) {
          const typeArguments = reqRes.typeArguments;
          const [req, res] = typeArguments.map(o => o.getText());

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
      const children = node.getChildren();
      const identifier = children.find(ts.isIdentifier).getText();
      if (identifier === "RPCService") {
        const serviceName = node.typeArguments[0].getText().replace(/"/g, "");
        currentService.serviceName = serviceName;
      }
    }
  };

  ts.forEachChild(source, visitInterfaceDeclaration);

  const imports = services.reduce((importNames, service) => {
    const { serviceDefinitionName } = service;
    const routeNames = service.routes.map(route => route.routeName);
    importNames.concat([...routeNames, serviceDefinitionName]);
    return importNames;
  }, []);

  const handlebarsData: HandlebarsTemplate = {
    services,
    imports
  };

  return handlebarsData;
};
