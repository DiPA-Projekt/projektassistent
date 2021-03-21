# Projektassistent

Dies ist das Full Stack Repository für den PA (the core module)

## Code of Conduct

Die Zusammenarbeit in diesem Projekt wird durch den
[Verhaltenscodex](https://github.com/DiPA-Projekt/contribution/blob/master/CODE_OF_CONDUCT.md) geregelt. Von
allen Mitarbeitenden wird dessen Einhaltung erwartet. Bitte melden Sie inakzeptables Verhalten an info@dipa.online.

## Entwicklung und Architektur

Nähere Informationen zur Architektur, der Entwicklungsumgebung, den Projekt-Konventionen und zur Mitarbeit können
auf unsere, [Development Guide](DEVELOPMENT.md) nachgelesen werden.

### GitHub Packages einrichten

#### GitHub Personal Access Token anlegen

Gehen Sie in Ihre persönlichen GitHub-Einstellungen und erstellen Sie sich einen Personal Access Token mit dem Recht von der Registry lesen zu dürfen.

Link: https://github.com/settings/tokens

![image](https://user-images.githubusercontent.com/6279703/111908499-cb273980-8a59-11eb-85d5-5630c5c8e4bd.png)


#### Maven

Legen Sie eine `settings.xml` im `~/.m2` Verzeichnis an oder ergänzen Sie es entsprechend.

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                      http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <activeProfiles>
    <activeProfile>github-packages</activeProfile>
  </activeProfiles>

  <profiles>
    <profile>
      <id>github-packages</id>
      <repositories>
        <repository>
          <id>github-packages</id>
          <name>GitHub - DiPA-Projekt</name>
          <url>https://maven.pkg.github.com/dipa-projekt/projektassistent-openapi</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>true</enabled></snapshots>
        </repository>
      </repositories>
    </profile>
  </profiles>
  <servers>
    <server>
      <id>github-packages</id>
      <username>HIER_GITHUB_BENUTERNAME_EINTRAGEN</username>
      <password>HIER_IHREN_GITHUB_PERSONAL_ACCESS_TOKEN_EINTRAGEN</password>
    </server>
  </servers>
</settings>
```

#### NPM

Geben Sie folgenden Befehl ein, um den GitHub Personal Access Token für NPM zu setzen.

`npm config set //registry.npmjs.org/:_authToken HIER_IHREN_GITHUB_PERSONAL_ACCESS_TOKEN_EINTRAGEN`

## Lizenz

Der PA wird unter der Version 2.0 der [Apache License](https://www.apache.org/licenses/LICENSE-2.0) entwickelt.

## Projekt Infrastruktur

Development Stand: https://padev.dipa.online/#/

Prod: https://pa.dipa.online/

Build und Deployment sind als Github Actions hinterlegt.

## Sonstiges

`mvn clean install -pl client,server`
![image](https://user-images.githubusercontent.com/6279703/111908464-a7fc8a00-8a59-11eb-8abb-d409b4930fdc.png)

