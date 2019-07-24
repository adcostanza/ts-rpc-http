import * as ts from "typescript";

interface Call {
  name?: string;
  request?: string;
  response?: string;
}
interface Service {
  name?: string;
  calls: Call[];
}
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

      if (currentService != undefined) {
        services.push(currentService);
      }

      currentService = { calls: [] };
      //look for heritage clause to RPCService
      const heritageClause = node.heritageClauses[0];
      ts.forEachChild(heritageClause, visitExpressionWithTypeArguments);

      node.members.filter(ts.isPropertySignature).forEach(propertySignature => {
        const propertyChildren = propertySignature.getChildren();
        const identifier = propertyChildren.find(ts.isIdentifier).getText();
        const reqRes = propertyChildren.find(ts.isTypeReferenceNode);
        const typeArguments = reqRes.typeArguments;
        const [req, res] = typeArguments.map(o => o.getText());

        currentService.calls.push({
          name: identifier,
          request: req,
          response: res
        });
      });
    }
  };

  const visitExpressionWithTypeArguments = (node: ts.Node) => {
    if (ts.isExpressionWithTypeArguments(node)) {
      const children = node.getChildren();
      const identifier = children.find(ts.isIdentifier).getText();
      if (identifier === "RPCService") {
        const serviceName = node.typeArguments[0].getText().replace(/"/g, "");
        currentService.name = serviceName;
      }
    }
  };

  ts.forEachChild(source, visitInterfaceDeclaration);

  console.log(currentService);
});
