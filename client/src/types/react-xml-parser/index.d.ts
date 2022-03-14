declare module 'react-xml-parser' {
  export interface XMLElement {
    name: string;
    attributes: {
      [name: string]: string;
    };
    value: string;
    children: XMLElement[];
    getElementsByTagName(string): XMLElement[];
  }

  export default class XMLParser {
    public constructor();

    public parseFromString(string: string): XMLElement;

    public toString(xml: XMLElement): string;

    public getElementsByTagName(tagName: string): XMLElement[];
  }
}
