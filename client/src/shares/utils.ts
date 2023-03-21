import he from 'he';
import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';
import { NavMenuItem } from '../components/projekthandbuch/documentation/navigation/navigation';

export function typeIt<T>(json: Object): T {
  const typed = JSON.parse(JSON.stringify(json)) as { default: T };
  return typed.default;
}

export function removeHtmlTags(html: string): string {
  return html.replace(/(<([^>]+)>)/gi, '');
}

export function decodeXml(xml: string): string {
  return xml ? he.decode(he.decode(xml)) : '';
}

export function getMenuItemByAttributeValue(menuItems: NavMenuItem[], attribute: string, key: string) {
  if (menuItems) {
    for (const menuItem of menuItems) {
      if (menuItem[attribute as keyof NavMenuItem] === key) {
        return menuItem;
      }
      if (menuItem.children && menuItem.children.length > 0) {
        const found: any = getMenuItemByAttributeValue(menuItem.children, attribute, key);
        if (found) {
          return found;
        }
      }
    }
  }
}

export function flatten(data: any[]) {
  return data.reduce((r, { children, ...rest }) => {
    r.push(rest);
    if (children) {
      r.push(...flatten(children));
    }
    return r;
  }, []);
}

export async function getJsonDataFromXml(url: string): Promise<XMLElement | void> {
  return axios
    .get(url)
    .then((response: any) => {
      return new XMLParser().parseFromString(response.data);
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

// export function removeEmptyParams(paramsObject: any): any {
//   if (paramsObject == null) {
//     return null;
//   } else {
//     return Object.keys(paramsObject).forEach((k) => paramsObject[k] == null && delete paramsObject[k]);
//   }
// }
