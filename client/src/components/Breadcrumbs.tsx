import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useDocumentation } from '../context/DocumentationContext';
import { Breadcrumb } from 'antd';
import { decodeXml, getSearchStringFromHash } from '../shares/utils';

export function Breadcrumbs() {
  // const [pathSnippets, setPathSnippets] = useState<string[]>([]);

  const location = useLocation();

  const { onRouteChanged } = useDocumentation();

  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

  const { navigationData, getNavigationPath, setCurrentSelectedKeys, setOpenKeys } = useDocumentation();

  useEffect(() => {
    const currentPathSnippets = location.pathname.split('/').filter((i) => i);

    // setPathSnippets(currentPathSnippets);

    const itemId = currentPathSnippets[currentPathSnippets.length - 1];

    onRouteChanged(itemId);

    let breadcrumbItems = [
      {
        title: <Link to="/documentation">Dokumentation</Link>,
        key: 'documentation',
      },
    ];

    if (navigationData.length > 0) {
      const parents = getNavigationPath(itemId).filter(
        (item: { key: string; label: string }) => item?.key !== undefined
      );
      const navigationPathKeys = parents.map((parent: { key: string; label: string }) => parent.key);

      setCurrentSelectedKeys(navigationPathKeys);
      setOpenKeys(navigationPathKeys);
      // console.log('navigationPathKeys', navigationPathKeys);

      let extraBreadcrumbItems = [];

      if (parents) {
        extraBreadcrumbItems = parents
          .map((parent: { key: string; label: string }) => {
            const url = '/documentation/' + parent?.key + getSearchStringFromHash();
            return {
              key: url,
              title: <Link to={url}>{decodeXml(parent?.label)}</Link>,
            };
          })
          .reverse();
      }

      breadcrumbItems = breadcrumbItems.concat(extraBreadcrumbItems);
    }
    setBreadcrumbs(breadcrumbItems);

    //eslint-disable-next-line
  }, [location, navigationData]);

  return <Breadcrumb items={breadcrumbs} style={{ margin: '16px 0' }} />;
}
