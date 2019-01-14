export default function reactToKeyboardAction(model, event) {
  switch (event.originalEvent.keyCode) {
    case 103: //g
      const a = model.selected.toMove[0]

      const px = parseFloat(a.x) + ( parseFloat(a.width) / 2 );
      const py = parseFloat(a.y) + ( parseFloat(a.height) / 2 );
      var rotate = a.rotate || 0;
      rotate += 30;
      a.rotate = rotate;
      a.transform = `rotate(${rotate}, ${px}, ${py})`;
      break;
    case 46: //delete selection
      const toDelete = model.selected.toMove[0];
      var square = -1;
      model.annotations.some((x, index) => {
        if (x[1].x === toDelete.x
          && x[1].y === toDelete.y) {
          square = index;
          return true;
        }
        return false;
      });
      if (square > -1) {
        model.selected = null;
        model.infographics = [];
        model.annotations.splice(square, 1);
      }
      break;
    default: break;
  }
}
