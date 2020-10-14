import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { environment } from '../../environments/environment';

declare var H: any;

@Component({
  selector: 'app-here-map',
  templateUrl: './here-map.component.html',
  styleUrls: ['./here-map.component.scss']
})
export class HereMapComponent implements OnInit, AfterViewInit {
  // Map management
  private map: any;
  private defaultLayers: any
  private behavior: any;
  private ui: any;
  private viewModel: any;

  // map HTML element
  @ViewChild('map', {static: false}) public mapElement: ElementRef;

  // element settings
  @Input() width = '100%';
  @Input() height = '400px';

  // map settings
  @Input() center: {lat: number, lng: number};

  // animation Settings
  rotationSpeed = 1.2;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // create the Platform
    let platform = new H.service.Platform({
      apikey: environment.hereAPIKey
    });

    // create the Layers
    // TODO here we can use an Input to load specific layers
    this.defaultLayers = platform.createDefaultLayers();

    // build the map
    this.map = new H.Map(
      this.mapElement.nativeElement,
      this.defaultLayers.vector.normal.map,
      {
        zoom: 12,
        center: this.center
      }
    );

    // in HERE we need to define the interactivity by hand? WTF?
    this.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    // ui
    this.ui = H.ui.UI.createDefault(this.map, this.defaultLayers);

    // HERE does not resize by default ?!
    window.addEventListener('resize', () => this.map.getViewPort().resize());

    // test the animation stuff
    this.viewModel =   this.map.getViewModel();
    this.viewModel.setLookAtData({
      position: this.center,
      zoom: 12,
      tilt: 60
    }, {opt_animate: true});

      // dev
    (window as any).layers = this.defaultLayers;
    (window as any).map = this.map;

    setTimeout(this.startRotation.bind(this), 200);
  }

  startRotation(): void {
    this.viewModel.startControl();
    this.rotate();
  }

  rotate(): void {
    this.viewModel.control(0, 0, 0, 0, this.rotationSpeed, 0);
  }

  endRotation(): void {
    this.viewModel.endControl(true, requested => requested.zoom = Math.round(requested.zoom));
  }
}
