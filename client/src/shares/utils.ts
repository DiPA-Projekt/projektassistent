import he from 'he';

export function typeIt<T>(json: Object): T {
  const typed = JSON.parse(JSON.stringify(json)) as { default: T };
  return typed.default;
}

export function removeHtmlTags(html: string): string {
  return html.replace(/(<([^>]+)>)/gi, '');
}

const umlautMap = {
  '\u00dc': 'UE',
  '\u00c4': 'AE',
  '\u00d6': 'OE',
  '\u00fc': 'ue',
  '\u00e4': 'ae',
  '\u00f6': 'oe',
  '\u00df': 'ss',
};

export function replaceUmlaute(html: string): string {
  // const pattern = /(\G(?!^)|<)([^<>]*?)([üöä])/;

  return html
    .replace(/[\u00dc|\u00c4|\u00d6][a-z]/g, (a) => {
      const big = umlautMap[a.slice(0, 1)];
      return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
    })
    .replace(new RegExp('[' + Object.keys(umlautMap).join('|') + ']', 'g'), (a) => umlautMap[a]);
}

export function decodeXml(xml: string): string {
  return xml ? he.decode(he.decode(xml)) : '';
}
