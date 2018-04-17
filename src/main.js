import { Rect } from 'OpenSeadragon';
import { h, render } from 'preact';
import Overlay from './views/Overlay';
import { DrawControl, MoveControl } from './views/Controls';
import createDispatcher from './model/createDispatcher';
import generalActions from './model/generalActions';
import createModel from './model/createModel';

const annotationsPrototype = {
  onOpen() {
    this.model.isactive = true;
    this.overlay = render(h(Overlay, { dispatch: this.dispatch, model: this.model }));
    const homeBounds = this.viewer.world.getHomeBounds();
    this.viewer.addOverlay(this.overlay, new Rect(0, 0, homeBounds.width, homeBounds.height));
    const zoom = this.viewer.viewport.getZoom();
    const { width, height } = this.overlay.getBoundingClientRect();
    this.dispatch({ type: 'INITIALIZE', zoom, width, height });
    this.controls = [
      new MoveControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
      new DrawControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
    ];
  },

  onClose() {
    // TODO
  },

  getAnnotations() {
    return this.model.getAll();
  },

  setAnnotations(annotations) {
    this.dispatch({ type: 'ANNOTATIONS_RESET', annotations });
  },

  cleanAnnotations() {
    this.dispatch({ type: 'ANNOTATIONS_RESET' });
  },

  getMode() {
    return this.model.mode;
  },

  setMode(mode) {
    this.dispatch({ type: 'MODE_UPDATE', mode });
  },

  getStatus() {
    return { active: !!this.overlay };
  },

  setEnable(active) {
    this.model.isactive = !!active;
    for (let index = 0; index < this.controls.length; index += 1) {
      if (this.model.isactive) {
        this.controls[index].btn.enable();
      } else {
        this.controls[index].btn.disable();
      }
    }
  },

  getLength(annotation) {
    let linelength = 0;
    const homeBounds = this.viewer.source.dimensions;
    const ImageWidthInPercent = homeBounds.x / 100;
    const ImageHeightInPercent = homeBounds.y / 100;
    switch (annotation[0]) {
      case 'line': {
        const dx = ((annotation[1].x2 - annotation[1].x1) * ImageWidthInPercent);
        const dy = ((annotation[1].y2 - annotation[1].y1) * ImageHeightInPercent);
        linelength = Math.sqrt((dx * dx) + (dy * dy));
        break;
      }
      case 'path': {
        // remove first 'M'
        const points = annotation[1].d.substring(1).split(' L');
        if (points.length > 1) {
          for (let index = 1; index < points.length; index += 1) {
            const p1 = points[index - 1].split(' ');
            const p2 = points[index].split(' ');
            const dx = ((p1[0] - p2[0]) * ImageWidthInPercent);
            const dy = ((p1[1] - p2[1]) * ImageHeightInPercent);
            linelength += Math.sqrt((dx * dx) + (dy * dy));
          }
        }
        break;
      }
      default:
    }
    return (linelength);
  },
};

export default ({ viewer }) => {
  const model = createModel();
  const dispatch = createDispatcher(model, generalActions);
  const annotations = Object.create(annotationsPrototype);
  Object.assign(annotations, { viewer, model, dispatch });
  viewer.addHandler('open', () => annotations.onOpen());
  viewer.addHandler('zoom', ({ zoom }) => annotations.dispatch({ type: 'ZOOM_UPDATE', zoom }));
  if (viewer.isOpen()) { annotations.onOpen(); }
  return annotations;
};

