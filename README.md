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

DiPA besteht aus mehreren Modulen die über GitHub-Packages geteilt werden. Hierzu ist es erforderlich eine GitHub-Token einzurichten, weil GitHub keine reines public-Sharing erlaubt. Unter dem folgenden Link, wird beschieben, wie die Einrichtung erfolgt:

- https://github.com/DiPA-Projekt/contribution/blob/master/DEVELOPMENT.md#entwicklungsumgebung-einrichten

## Lizenz

Der PA wird unter der Version 2.0 der [Apache License](https://www.apache.org/licenses/LICENSE-2.0) entwickelt.

## Projekt Infrastruktur

Development Stand: https://padev.dipa.online/#/

Prod: https://pa.dipa.online/

Build und Deployment sind als Github Actions hinterlegt.

## Sonstiges

`mvn clean install -pl client,server`
![image](https://user-images.githubusercontent.com/6279703/111908464-a7fc8a00-8a59-11eb-8abb-d409b4930fdc.png)
