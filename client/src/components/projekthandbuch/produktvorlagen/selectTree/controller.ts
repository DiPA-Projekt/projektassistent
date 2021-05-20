import { AbstractController } from '@leanup/lib/components/generic';

import { DI } from '@leanup/lib/helpers/injector';
import { ProduktvorlagenService } from '../../../../services/projekthandbuch/produktvorlagen/service';
import React, { Key } from 'react';
import { DataNode } from 'antd/lib/tree';

export class SelectTreeController extends AbstractController {
  public readonly produktvorlagenService: ProduktvorlagenService = DI.get<ProduktvorlagenService>('Produktvorlagen');

  public disabled = false;
  public data: DataNode[] = [];
  public expandedKeys: React.Key[] = [];

  public selectedKeys: React.Key[] = [];
  public autoExpandParent = true;

  public showAll = false;
  public checkAllProductTemplates = false;
  public checkAllSamples = false;
  public checkedKeys: React.Key[] | { checked: Key[]; halfChecked: Key[] } = []; // this.props.defaultCheckedKeys;
}
