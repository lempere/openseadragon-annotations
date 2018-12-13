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
        if ((model.mode === 'LINEDRAW' || model.mode === 'FREEDRAW' || model.mode === 'SQUAREDRAW') && model.controlsactive) {
          // Remove existing annotation if it has same non-empty name
          if (model.annotationname !== '') {
            const i = model.getAnnotationsIdxByName(model.annotationname);
            if (i >= 0) {
              model.annotations.splice(i, 1);
            }
          }
          model.activityInProgress = true;
          switch (model.mode) {
            case 'LINEDRAW':
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
            case 'FREEDRAW':
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
            case 'SQUAREDRAW':
              model.annotations.push([
                'rect',
                {
                  x: `${action.x}`,
                  y: `${action.y}`,
                  fill: 'none',
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

      case 'LEAVE_CANVAS':
      case 'RELEASE':
        if ((model.mode === 'LINEDRAW' || model.mode === 'FREEDRAW' || model.mode === 'SQUAREDRAW') && model.activityInProgress === true) {
          model.raiseEvent('ANNOTATIONRELEASE_EVENT', model.annotations[model.annotations.length - 1]);
          model.activityInProgress = false;
          model.annotations.splice(model.annotations.length - 2, 1);
        }
        break;

      case 'MOVE':
        if ((model.mode === 'LINEDRAW' || model.mode === 'FREEDRAW' || model.mode === 'SQUAREDRAW') && model.activityInProgress === true) {
          const lastAnnotation = model.annotations[model.annotations.length - 1];
          if (lastAnnotation && lastAnnotation[0] === 'path') {
            lastAnnotation[1].d += ` L${action.x} ${action.y}`;
          } else if (lastAnnotation && lastAnnotation[0] === 'line') {
            lastAnnotation[1].x2 = `${action.x}`;
            lastAnnotation[1].y2 = `${action.y}`;
          } else if (lastAnnotation && lastAnnotation[0] === 'rect') {
            const startAnnotation = model.annotations[model.annotations.length - 2];
            let width = action.x - startAnnotation[1].x;
            let height = action.y - startAnnotation[1].y;

            if (width < 0 || height < 0) {
              if (width < 0 && height < 0) {
                width = startAnnotation[1].x - action.x;
                height = startAnnotation[1].y - action.y;

                lastAnnotation[1].x = action.x;
                lastAnnotation[1].y = action.y;
              } else if (width < 0) {
                width = startAnnotation[1].x - action.x;
                lastAnnotation[1].x = action.x;
              } else if (height < 0) {
                height = startAnnotation[1].y - action.y;
                lastAnnotation[1].y = action.y;
              }
            }
            lastAnnotation[1].width = `${width}`;
            lastAnnotation[1].height = `${height}`;
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
