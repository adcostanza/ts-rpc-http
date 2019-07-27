import * as ts from "typescript";
import {HandlebarsTemplate, Service} from "../../../src/generator";

test("extract via ast", async () => {
  // hardcode our input file
  const filePath = "./test/integration/generation/models.ts";
  // create a program instance, which is a collection of source files
  // in this case we only have one source file
  const program = ts.createProgram([filePath], {});

  // pull off the typechecker instance from our program
  const checker = program.getTypeChecker();

  // get our models.ts source file AST
  const source = program.getSourceFile(filePath);

  // create TS printer instance which gives us utilities to pretty print our final AST
  const printer = ts.createPrinter();

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

  console.log(services);
});
