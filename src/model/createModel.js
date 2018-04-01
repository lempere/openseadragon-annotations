import { EventSource } from 'OpenSeadragon';

export default () =>
  Object.assign(Object.create(EventSource.prototype), {
    events: {},
    mode: 'MOVE',
    zoom: 1,
    width: 0,
    height: 0,
    activityInProgress: false,
    annotations: [],
    annotationtype: 'LINE',
    annotationcolor: 'green',
    annotationlinewidth: 3,
    annotationname: '',

    getAnnotationsIdxByName(annotationname) {
      let i = 0;
      while (i < this.annotations.length) {
        if (annotationname === this.annotations[i][2]) {
          return (i);
        }
        i += 1;
      }
      return (-1);
    },

    getAnnotationByName(annotationname) {
      const i = this.getAnnotationsIdxByName(annotationname);
      if (i >= 0) {
        return (this.annotations[i]);
      }
      return (null);
    },
  });
