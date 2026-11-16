import he from 'he';
import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';
import { NavMenuItem } from '../components/projekthandbuch/documentation/navigation/Navigation';

const { convert } = require('html-to-text');

export function typeIt<T>(json: Object): T {
  const typed = JSON.parse(JSON.stringify(json)) as { default: T };
  return typed.default;
}

/***
 * convert html string into plain text without html tags but with line breaks etc.
 * @param html html string to convert
 */
export function removeHtmlTags(html: string): string {
  return convert(html);
}

export function decodeXml(xml: string): string {
  return xml ? he.decode(he.decode(xml)) : '';
}

export function simpleDecodeXml(xml: string): string {
  return xml ? he.decode(xml) : '';
}

export function getMenuItemByAttributeValue(
  menuItems: NavMenuItem[],
  attribute: string,
  key: string
): NavMenuItem | undefined {
  if (menuItems) {
    for (const menuItem of menuItems) {
      if (menuItem[attribute as keyof NavMenuItem] === key) {
        return menuItem;
      }
      if (menuItem.children && menuItem.children.length > 0) {
        const found = getMenuItemByAttributeValue(menuItem.children, attribute, key);
        if (found) {
          return found;
        }
      }
    }
  }
  return undefined;
}

export function flatten(data: NavMenuItem[]) {
  return data.reduce((r, { children, ...rest }) => {
    r.push(rest);
    if (children) {
      r.push(...flatten(children));
    }
    return r;
  }, []);
}

export async function getJsonDataFromXml(url: string): Promise<XMLElement> {
  try {
    return axios.get(url).then((response) => {
      return new XMLParser().parseFromString(response.data as string);
    });
  } catch (err) {
    throw Error('Unable to parse xml data.');
  }
}

export function clean(obj: { [key: string]: string | undefined }) {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
  return obj;
}

export function getSearchStringFromHash() {
  const searchHash = location.hash;
  return searchHash.substring(searchHash.indexOf('?'));
}

export function getFigureDesignationFromText(text: string) {
  const matches = text.match(/\[Abb:(.*?)\]/);

  if (matches) {
    return matches[1];
  }
  return null;
}

export function fixLinksInText(testString: string): string {
  const url = '#/documentation/';

  // TODO: only replace link to entries if they match a navigation id otherwise it is a local reference to an anchor
  //  on the same page like in glossary
  return testString.replace(
    /href=['"]#(?:[^"'\/]*\/)*([^'"]+)['"]/g,
    'href="' + url + '$1' + getSearchStringFromHash() + '"'
  );
}

export function replaceUrlInText(text: string, tailoringParameter: any, projectFeaturesString: string): string {
  return text.replace(
    /src=['"](?:[^"'\/]*\/)*([^'"]+)['"]/g,
    'src="https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Grafik/images/$1?' +
      projectFeaturesString +
      '"'
  );
}

export function replaceImageUrlInText(text: string, tailoringParameter: any): string {
  return text.replace(
    /src=['"](?:[^"'\/]*\/)*([^'"]+)['"]/g,
    'src="https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/xxx/Projekttypvariante/xxx/Grafik/images/$1"'
  );
}


/**
 * Resolves relative image sources in Tailoring HTML against the selected Tailoring's
 * Grafik directory. Existing absolute, data, blob and protocol-relative URLs are left untouched.
 */
export function replaceImageUrlsInHtml(
  html: string,
  tailoringParameter: {
    modelVariantId?: string;
    projectTypeId?: string;
    projectTypeVariantId?: string;
  },
  apiBaseUrl: string,
  projectFeaturesString: string
): string {
  const { modelVariantId, projectTypeId, projectTypeVariantId } = tailoringParameter;

  if (!html || !modelVariantId || !projectTypeId || !projectTypeVariantId) {
    return html;
  }

  const imageBaseUrl = new URL(
    '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Grafik/',
    apiBaseUrl.endsWith('/') ? apiBaseUrl : apiBaseUrl + '/'
  );

  return html.replace(/(<img\b[^>]*?\bsrc\s*=\s*)(["'])(.*?)\2/gi, (imageTag, prefix, quote, source) => {
    if (!source || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(source)) {
      return imageTag;
    }

    try {
      const resolvedUrl = new URL(source, imageBaseUrl);

      // Do not allow a relative path to escape the selected Tailoring's Grafik directory.
      if (resolvedUrl.origin !== imageBaseUrl.origin || !resolvedUrl.pathname.startsWith(imageBaseUrl.pathname)) {
        return imageTag;
      }

      if (projectFeaturesString) {
        new URLSearchParams(projectFeaturesString).forEach((value, key) => {
          resolvedUrl.searchParams.set(key, value);
        });
      }

      const imageAttributes = imageTag.slice(prefix.length + quote.length + source.length + quote.length);
      const styleMatch = imageAttributes.match(/\\bstyle\\s*=\\s*(["'])(.*?)\\1/i);
      const responsiveStyle = 'max-width:100%;height:auto';

      if (styleMatch) {
        const existingStyle = styleMatch[2].trim().replace(/;?$/, ';');
        const updatedStyle = existingStyle + responsiveStyle;
        const updatedTag = imageTag.replace(styleMatch[0], 'style=' + styleMatch[1] + updatedStyle + styleMatch[1]);
        return updatedTag.replace(source, resolvedUrl.toString());
      }

      return imageTag.replace(
        /\\bsrc\\s*=\\s*(["'])(.*?)\\1/i,
        'src=' + quote + resolvedUrl.toString() + quote
      ).replace(/<img\\b/i, '<img style="max-width:100%;height:auto"');
    } catch {
      return imageTag;
    }
  });
}

export function removeLinksFromHtml(htmlString: string) {
  const elem = document.createElement('div');
  elem.innerHTML = htmlString;

  const aTag = elem.getElementsByTagName('a');

  while (aTag.length) {
    const parent = aTag[0].parentNode;
    while (aTag[0].firstChild) {
      parent?.insertBefore(aTag[0].firstChild, aTag[0]);
    }
    parent?.removeChild(aTag[0]);
  }

  return elem.innerHTML;
}
