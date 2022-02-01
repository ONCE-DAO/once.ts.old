import path from "path";
import fs from "fs";
import { Package } from "./Package";
import { execSync } from "child_process";
import chmodrSync from "chmodr";

export class OnceBuilder {
  static async buildSubmodule(submodulePath: string) {
    const pkg = await Package.getByPath(
      path.join(submodulePath, "package.json")
    );

    const snapshot = path.basename(submodulePath).split("@")[1];
    const version = `${pkg?.version}-SNAPSHOT-${snapshot}`;
    fs.writeFileSync(
      path.join(submodulePath, "tsconfig.build.json"),
      `{
        "extends": "./tsconfig.json",
        "compilerOptions": {
            "rootDir":"./",
          "outDir": "${version}"
        },
        "include": [
            "src/**/*.ts"
        ],
      }`,
      { encoding: "utf8", flag: "w" }
    );
    execSync(`npx --prefix ${submodulePath} tsc -p tsconfig.build.json `);
    fs.cpSync(
      path.join(submodulePath, "node_modules"),
      path.join(submodulePath, version, "node_modules"),
      { recursive: true }
    );
    fs.cpSync(
      path.join(submodulePath, "ressources"),
      path.join(submodulePath, version, "ressources"),
      { recursive: true }
    );
    fs.cpSync(
      path.join(submodulePath, "package.json"),
      path.join(submodulePath, version, "package.json"),
      { recursive: true }
    );
    fs.writeFileSync(
      path.join(
        submodulePath,
        version,
        `${pkg?.name}.${pkg?.version?.replace(/\./g, "_")}.component.xml`
      ),
      ""
    );
    const dist = path.join(submodulePath, "..", "..", "dist", version);
    const current = path.join(dist, "..", "current");
    if (fs.existsSync(dist)) {
      console.log("DIST", dist);
      fs.rmSync(dist, { recursive: true });
      fs.unlinkSync(current);
    }
    fs.mkdirSync(dist, { recursive: true });

    fs.renameSync(path.join(submodulePath, version), dist);
    fs.symlinkSync(dist, current);

    // Make readonly with build number
    // chmodrSync(dist, 0o744, (err) => console.error(err))
  }
}
