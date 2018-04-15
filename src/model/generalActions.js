const reactToGeneralAction = (model) =>
  (action) => {
    switch (action.type) {
      case 'MODE_UPDATE':
        model.activityInProgress = false;
        if (model.mode !== action.mode) {
          model.mode = action.mode;
        }
        break;

      case 'ACTIVITY_UPDATE':
        model.activityInProgress = action.inProgress;
        break;

      case 'PRESS':
        if (model.mode === 'DRAW' && model.isactive) {
          // Remove existing annotation if it has same non-empty name
          if (model.annotationname !== '') {
            const i = model.getAnnotationsIdxByName(model.annotationname);
            if (i >= 0) {
              model.annotations.splice(i, 1);
            }
          }
          model.activityInProgress = true;
          switch (model.annotationtype) {
            case 'LINE':
              model.annotations.push([
                'line',
                {
                  x1: `${action.x}`,
                  y1: `${action.y}`,
                  x2: `${action.x}`,
                  y2: `${action.y}`,
                  stroke: `${model.annotationcolor}`,
                  'stroke-width': `${model.annotationlinewidth}`,
                  'vector-effect': 'non-scaling-stroke',
                }, `${model.annotationname}`,
              ]);
              break;
            case 'PATH':
              model.annotations.push([
                'path',
                {
                  fill: 'none',
                  d: `M${action.x} ${action.y}`,
                  stroke: `${model.annotationcolor}`,
                  'stroke-width': `${model.annotationlinewidth}`,
                  'stroke-linejoin': 'round',
                  'stroke-linecap': 'round',
                  'vector-effect': 'non-scaling-stroke',
                }, `${model.annotationname}`,
              ]);
              break;
            default:
              break;
          }
        }
        break;

      case 'RELEASE':
        if (model.mode === 'DRAW') {
          model.activityInProgress = false;
        }
        break;

      case 'MOVE':
        if (model.mode === 'DRAW' && model.activityInProgress === true) {
          const annotations = model.annotations;
          const lastAnnotation = annotations[annotations.length - 1];
          if (lastAnnotation && lastAnnotation[0] === 'path') {
            lastAnnotation[1].d += ` L${action.x} ${action.y}`;
          } else if (lastAnnotation && lastAnnotation[0] === 'line') {
            lastAnnotation[1].x2 = `${action.x}`;
            lastAnnotation[1].y2 = `${action.y}`;
          }
        }
        break;

      case 'ANNOTATIONS_RESET':
        model.activityInProgress = false;
        model.annotations = action.annotations || [];
        break;

      case 'ZOOM_UPDATE':
        model.zoom = action.zoom;
        break;

      case 'LEAVE_CANVAS':
        if (model.mode === 'DRAW') {
          model.activityInProgress = false;
        }
        break;

      case 'INITIALIZE':
        model.zoom = action.zoom;
        model.width = action.width;
        model.height = action.height;
        break;

      default:
        break;
    }

    model.raiseEvent('CHANGE_EVENT');
  };

export default reactToGeneralAction;
