import he from 'he';
import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';

export function typeIt<T>(json: Object): T {
  const typed = JSON.parse(JSON.stringify(json)) as { default: T };
  return typed.default;
}

export function removeHtmlTags(html: string): string {
  return html.replace(/(<([^>]+)>)/gi, '');
}

// const umlautMap: { [key: string]: string } = {
//   '\u00dc': 'UE',
//   '\u00c4': 'AE',
//   '\u00d6': 'OE',
//   '\u00fc': 'ue',
//   '\u00e4': 'ae',
//   '\u00f6': 'oe',
//   '\u00df': 'ss',
// };
//
// export function replaceUmlaute(html: string): string {
//   // const pattern = /(\G(?!^)|<)([^<>]*?)([üöä])/;
//
//   return html
//     .replace(/[\u00dc|\u00c4|\u00d6][a-z]/g, (a) => {
//       const big = umlautMap[a.slice(0, 1)];
//       return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
//     })
//     .replace(new RegExp('[' + Object.keys(umlautMap).join('|') + ']', 'g'), (a) => umlautMap[a]);
// }

export function decodeXml(xml: string): string {
  return xml ? he.decode(he.decode(xml)) : '';
}

export function findIdInMenuEntry(id: string, arr: MenuEntry[]): MenuEntry | null {
  return arr.reduce<MenuEntry>((prev: MenuEntry, current: MenuEntry) => {
    // console.log('find', prev, current);
    if (prev) {
      return prev;
    }
    if (current.id === id) {
      return current;
    }
    if (current.subMenuEntries) {
      return findIdInMenuEntry(id, current.subMenuEntries);
    }
  }, null);
}

export function getMenuItemByAttributeValue(menuItems: any[], attribute: string, key: string) {
  if (menuItems) {
    for (const item of menuItems) {
      // if (item[attribute]) {
      //   console.log('getMenuItemByAttributeValue', attribute, key);
      // }

      if (item[attribute] === key) {
        return item;
      }
      const found: any = getMenuItemByAttributeValue(item.children, attribute, key);
      if (found) {
        return found;
      }
    }
  }
}

export function findInNavigatinMenu(id: string, arr: MenuEntry[]): MenuEntry | null {
  return arr.reduce<MenuEntry>((prev: MenuEntry, current: MenuEntry) => {
    // console.log('find', prev, current);
    if (prev) {
      return prev;
    }
    if (current.id === id) {
      return current;
    }
    if (current.subMenuEntries) {
      return findIdInMenuEntry(id, current.subMenuEntries);
    }
  }, null);
}

export async function getJsonDataFromXml(url: string, convertUmlauts: boolean = false): Promise<string | XMLElement> {
  return axios
    .get(url)
    .then((response) => {
      if (convertUmlauts) {
        return new XMLParser().parseFromString(replaceUmlaute(response.data));
      } else {
        return new XMLParser().parseFromString(response.data);
      }
    })
    .catch((e) => console.log('obligatory catch', e));
}

export function clean(obj: any) {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
  return obj;
}

export function removeEmptyParams(paramsObject: any): any {
  if (paramsObject == null) {
    return null;
  } else {
    return Object.keys(paramsObject).forEach((k) => paramsObject[k] == null && delete paramsObject[k]);
  }
}
