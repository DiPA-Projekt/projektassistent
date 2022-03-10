declare module 'react-xml-parser';

interface XMLElement {
  name: string;
  attributes: {
    [name: string]: string;
  };
  value: string;
  children: XMLElement[];
}

export default class XMLParser {
  public constructor();
  public parseFromString(string: string): XMLElement;
  public toString(xml: XMLElement): string;
  public getElementsByTagName(tagName: string): XMLElement[];
}
