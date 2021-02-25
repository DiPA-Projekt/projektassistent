import { Component, OnInit } from '@angular/core';
import { NavItem } from '../../nav-item';

@Component({
  selector: 'app-project-manual',
  templateUrl: './project-manual.component.html',
  styleUrls: ['./project-manual.component.scss'],
})
export class ProjectManualComponent implements OnInit {
  navMenuItems: NavItem[] = [];

  ngOnInit(): void {
    this.setSideNavMenu();
  }

  setSideNavMenu(): void {
    this.navMenuItems = [
      {
        name: 'Tailoring',
        icon: 'check_box',
        route: 'project-manual/tailoring',
      },
    ];
  }
}
