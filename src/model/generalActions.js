const reactToGeneralAction = (model) => {
  return (action) => {
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
        } else {
          const infographicHit = model.getObjectHit(action, model.infographics);

          if (infographicHit.length > 1) {
            const type = infographicHit.filter(x => x[2] === 'info');
            const dx = action.x - model.selected.start.x;
            const dy = action.y - model.selected.start.y;
            model.selected.resize = type[0][3];

            // switch (type[0][2]) {
            //   case 'resize-right-up':
            //     model.selected.width = parseFloat(model.selected.width) + dx;
            //     model.selected.start = action;
            //     break;
            //   default:
            //     break;
            // }
          } else {
            const objHit = model.getObjectHit(action);
            if (objHit && objHit.length > 0) {
              const obj = objHit[0][1];
              const x = parseFloat(obj.x);
              const y = parseFloat(obj.y);
              const width = parseFloat(obj.width);
              const height = parseFloat(obj.height);

              const selectedSquare = [
                'rect',
                {
                  x: `${parseFloat(obj.x) - 1.4}`,
                  y: `${parseFloat(obj.y) - 1.4}`,
                  width: `${parseFloat(obj.width) + 2.8}`,
                  height: `${parseFloat(obj.height) + 2.8}`,
                  fill: 'none',
                  stroke: `red`,
                  'stroke-width': `${model.annotationlinewidth}`,
                  'stroke-linejoin': 'round',
                  'stroke-linecap': 'round',
                  'vector-effect': 'non-scaling-stroke',
                }, `${model.annotationname}`,
              ];
              model.infographics[0] = selectedSquare;
              model.infographics[1] = [
                'rect',
                {
                  x: `${x + width - 1}`,
                  y: `${y - 1}`,
                  width: `${2}`,
                  height: `${2}`,
                  fill: 'white',
                  stroke: `white`,
                  'stroke-width': `${model.annotationlinewidth}`,
                  'stroke-linejoin': 'round',
                  'stroke-linecap': 'round',
                  'vector-effect': 'non-scaling-stroke',
                }, 'info', 'resize-right-up',
              ]
              model.infographics[2] = [
                'rect',
                {
                  x: `${x + width - 1}`,
                  y: `${y + height - 1}`,
                  width: `${2}`,
                  height: `${2}`,
                  fill: 'white',
                  stroke: `white`,
                  'stroke-width': `${model.annotationlinewidth}`,
                  'stroke-linejoin': 'round',
                  'stroke-linecap': 'round',
                  'vector-effect': 'non-scaling-stroke',
                }, 'info', 'resize-right-down',
              ]
              model.infographics[3] = [
                'rect',
                {
                  x: `${x - 1}`,
                  y: `${y + height - 1}`,
                  width: `${2}`,
                  height: `${2}`,
                  fill: 'white',
                  stroke: `white`,
                  'stroke-width': `${model.annotationlinewidth}`,
                  'stroke-linejoin': 'round',
                  'stroke-linecap': 'round',
                  'vector-effect': 'non-scaling-stroke',
                }, 'info', 'resize-left-down',
              ]
              model.infographics[4] = [
                'rect',
                {
                  x: `${x - 1}`,
                  y: `${y - 1}`,
                  width: `${2}`,
                  height: `${2}`,
                  fill: 'white',
                  stroke: `white`,
                  'stroke-width': `${model.annotationlinewidth}`,
                  'stroke-linejoin': 'round',
                  'stroke-linecap': 'round',
                  'vector-effect': 'non-scaling-stroke',
                }, 'info', 'resize-left-up',
              ]
              model.selected = {
                toMove: [obj, selectedSquare[1],
                  model.infographics[1][1], model.infographics[2][1],
                  model.infographics[3][1], model.infographics[4][1]],
                start: action,
                state: 'move',
              };
            } else {
              model.infographics = [];
              model.selected = null;
            }
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
        if (model.mode === 'POINTERDIMENSIONS' && model.selected) {
          model.selected.state = 'release';
          model.selected.resize = null;
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
        if (model.mode === 'POINTERDIMENSIONS') {
          if (model.selected) {
            const dx = action.x - model.selected.start.x;
            const dy = action.y - model.selected.start.y;
            if (model.selected.resize) {

              const maxX = parseFloat(model.selected.toMove[2].x + dx);
              const minX = parseFloat(model.selected.toMove[5].x + dx);
              const minY = parseFloat(model.selected.toMove[2].y + dy);
              const maxY = parseFloat(model.selected.toMove[3].y + dy);
              if (maxX - minX < 2 || maxY - minY < 2) {
                if (maxX - minX < 2) {
                  model.selected.toMove[0].width = 2.1;
                  model.selected.toMove[1].width = 4.1;
                } else {
                  model.selected.toMove[0].height = 2.1;
                  model.selected.toMove[0].height = 4.1;
                }
                // model.selected.state = 'release';
                // model.selected.resize = null;
                model.selected = null;
                return;
              }
              switch (model.selected.resize) {
                case 'resize-right-up':
                  model.selected.toMove[2].x = parseFloat(model.selected.toMove[2].x) + dx;
                  model.selected.toMove[2].y = parseFloat(model.selected.toMove[2].y) + dy;
                  model.selected.toMove[3].x = parseFloat(model.selected.toMove[3].x) + dx;
                  model.selected.toMove[5].y = parseFloat(model.selected.toMove[5].y) + dy;

                  model.selected.toMove.filter((i, n) => n < 2).forEach(obj => {
                    obj.width = parseFloat(obj.width) + dx;
                    obj.y = parseFloat(obj.y) + dy;
                    obj.height = parseFloat(obj.height) - dy;
                  });
                  break;
                case 'resize-right-down':
                  model.selected.toMove[3].x = parseFloat(model.selected.toMove[3].x) + dx;
                  model.selected.toMove[3].y = parseFloat(model.selected.toMove[3].y) + dy;
                  model.selected.toMove[2].x = parseFloat(model.selected.toMove[2].x) + dx;
                  model.selected.toMove[4].y = parseFloat(model.selected.toMove[4].y) + dy;
                  model.selected.toMove.filter((i, n) => n < 2).forEach(obj => {
                    obj.width = parseFloat(obj.width) + dx;
                    obj.height = parseFloat(obj.height) + dy;
                  });
                  break;
                case 'resize-left-down':
                  model.selected.toMove[4].x = parseFloat(model.selected.toMove[4].x) + dx;
                  model.selected.toMove[4].y = parseFloat(model.selected.toMove[4].y) + dy;
                  model.selected.toMove[5].x = parseFloat(model.selected.toMove[5].x) + dx;
                  model.selected.toMove[3].y = parseFloat(model.selected.toMove[3].y) + dy;
                  model.selected.toMove.filter((i, n) => n < 2).forEach(obj => {
                    obj.x = parseFloat(obj.x) + dx;
                    obj.width = parseFloat(obj.width) - dx;
                    obj.height = parseFloat(obj.height) + dy;
                  });
                  break;
                case 'resize-left-up':
                  model.selected.toMove[5].x = parseFloat(model.selected.toMove[5].x) + dx;
                  model.selected.toMove[5].y = parseFloat(model.selected.toMove[5].y) + dy;
                  model.selected.toMove[4].x = parseFloat(model.selected.toMove[4].x) + dx;
                  model.selected.toMove[2].y = parseFloat(model.selected.toMove[2].y) + dy;
                  model.selected.toMove.filter((i, n) => n < 2).forEach(obj => {
                    obj.x = parseFloat(obj.x) + dx;
                    obj.y = parseFloat(obj.y) + dy;
                    obj.height = parseFloat(obj.height) - dy;
                    obj.width = parseFloat(obj.width) - dx;
                  });
                  break;
                default:
                  break;
              }
            } else if (model.selected.state === 'move') {
              model.selected.toMove.forEach((obj, n) => {
                obj.x = parseFloat(obj.x) + dx;
                obj.y = parseFloat(obj.y) + dy;
              });
            }
            model.selected.start = action;
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
};

export default reactToGeneralAction;
