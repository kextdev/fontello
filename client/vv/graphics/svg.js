// get groups

var svgGetGroups = function (xml) {
  var groups = {
    $draw : $('#groupDraw', xml),
    $user : $('#groupUser', xml),
    $center : $('#groupCenter', xml),
    $view : $('#groupView', xml)
  };

  return groups;
};

// create groups
// groups example:
//              -> 10, 10, 200, 2000    # input bounding box
//  groupView   -> 0, 0, 1000, 1000     # fix to default view
//  groupCenter -> -500, -800           # move to center for user transform
//  groupUser   -> dx(-200, 100) sx(0.5)
//  groupDraw   -> +500, +800           # return for draw
//              -> 0, 0, 1000, 1000     # output


var svgCreateGroups = function (xml) {
  var xmlns="http://www.w3.org/2000/svg";
  var $svg = $('svg', xml);

  var groupDraw = document.createElementNS(xmlns, "g");
  groupDraw.setAttribute('id', 'groupDraw');
  $svg.append(groupDraw);
  
  var groupUser = document.createElementNS(xmlns, "g");
  groupUser.setAttribute('id', 'groupUser');
  groupDraw.appendChild(groupUser);

  var groupCenter = document.createElementNS(xmlns, "g");
  groupCenter.setAttribute('id', 'groupCenter');
  groupUser.appendChild(groupCenter);

  var groupView = document.createElementNS(xmlns, "g");
  groupView.setAttribute('id', 'groupView');
  groupCenter.appendChild(groupView);
};

