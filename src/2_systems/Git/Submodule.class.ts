import { execSync } from "child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { basename, join } from "path";
import { NpmPackage } from "../NpmPackage.class";
import { GitRepository } from "./GitRepository.class";

export class Submodule {
  path: string | undefined;

  static async start(path: string): Promise<Submodule> {
    const instance = new Submodule();
    instance.path = path;
    return instance;
  }

  build(copyFolder?: string[]) {
    if (!this.path) throw new Error("...");

    // install deps
    execSync(`npm install --prefix ${this.path}`);
    const npmPackage = NpmPackage.getByFolder(this.path);

    const snapshot = npmPackage?.name;
    const version = `${npmPackage?.version}-SNAPSHOT-${snapshot}`;
    // write tsconfig extensin
    writeFileSync(
      join(this.path, "tsconfig.build.json"),
      JSON.stringify(
        {
          extends: "./tsconfig.json",
          compilerOptions: {
            rootDir: "./",
            outDir: version,
          },
          include: ["src/**/*.ts"],
        },
        null,
        2
      ),
      { encoding: "utf8", flag: "w+" }
    );

    execSync(`npm --prefix ${this.path} run build:version`);
    existsSync(join(this.path, "node_modules")) &&
      cpSync(
        join(this.path, "node_modules"),
        join(this.path, version, "node_modules"),
        { recursive: true }
      );
    existsSync(join(this.path, "ressources")) &&
      cpSync(
        join(this.path, "ressources"),
        join(this.path, version, "ressources"),
        { recursive: true }
      );
    cpSync(
      join(this.path, "package.json"),
      join(this.path, version, "package.json"),
      { recursive: true }
    );
    writeFileSync(
      join(
        this.path,
        version,
        `${npmPackage?.name}.${npmPackage?.version
          ?.replace(/\./g, "_")
          .replace("/", "-")}.component.xml`
      ),
      ""
    );
    copyFolder &&
      copyFolder.forEach((f) => {
        existsSync(join(this.path || "", f)) &&
          cpSync(join(this.path || "", f), join(this.path || "", version, f), {
            recursive: true,
          });
      });
    const dist = join(this.path, "..", "..", "dist", version);
    const current = join(dist, "..", "current");
    if (existsSync(dist)) {
      console.log("DIST", dist);
      rmSync(dist, { recursive: true });
      unlinkSync(current);
    }
    mkdirSync(dist, { recursive: true });

    renameSync(join(this.path, version), dist);
    symlinkSync(dist, current);
  }
}
