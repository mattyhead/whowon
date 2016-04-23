var ENDPOINT = '/whowon/results.json',
  INTERVAL = 900000;
template = _.template($('#tmpl-race').html()),
// implement terrible, terrible scope cludgees, and feel much shame.
j = 0, timeToRefresh = 0,
v = d = p = r = c = t = [],
partyStyle = {};

var refresh = function() {
  NProgress.start(); // show loading indicator

  return $.getJSON(ENDPOINT, function(data) {
    NProgress.done(); // hide loading indicator
    // Apply parsing/transformations to each candidate
    _.map(data.city['results'].candidates, function(candidate) {
      candidate.percentage = parseFloat(candidate.percentage);
    });

    // data
    v = data.votes;
    //  indexes
    c = data.candidates;
    d = data.desc;
    p = data.parties;
    r = data.races;
    // might do something based on timestamp eventually
    t = data.timestamp;

    //console.log( /*'votes', v, 'candidates', c, 'desc', d, 'parties', p,*/ 'races', r /*, 'timestamp', t*/ );
    delete data.votes['00'];

    partyStyle = function(s) {
      switch (p[s]) {
        case "DEMOCRATIC":
          return "dem";
          break;
        case "REPUBLICAN":
          return "rep";
          break;
        default:
          return "ind";
          break;
      }
    };

    // Clear the container
    var $container = $('#main'),
      $menu = $('#menu'),
      menuContent = '',
      //$topnav = $('#topnav'),
      $bottomnav = $('#bottomnav'),
      i = 0;
    $container.empty();
    $menu.empty();
    for (race in r) {
      menuContent += '<li><a href="#' + r[race] + '">' + r[race] + '</a></li>';
    }
    $menu.append(menuContent);
    $bottomnav.attr('href', '#' + r[race]);

    // For each city-level race
    [].forEach.call(data.city['results'], function(race) {
      // Sort candidates by percentage
      race.candidates = _.sortBy(race.candidates, function(candidate) {
        return -candidate.percentage;
      });
      // Append the race to the container using the template
      $container.append(template(race));
    });

    // Set next refresh

    timeToRefresh = INTERVAL || new Date(data.nextrun) - new Date() + 1000;
    window.setTimeout(refresh, timeToRefresh);

    // let's tweak foundation in a casually kludgy way
    window.setTimeout(100, $(document).foundation('reflow'));
    // maybe just do this?
    //    return function() {$(document).foundation('reflow')};

  });
};

// Consider rolling these 2 into one

// long delegation, since these are js-rendered elements, and because little lord baby jesus pefers long delegation
$(document).on('click', 'div.all-wards', function() {
  var $contentEl = $('#ward-modal .modal-content'),
    $titleEl = $('#ward-modal h2'),
    content = '',
    candidateParty = $(this).data('cp'),
    candidateId = $(this).data('ci'),
    race = $(this).data('r'),
    party = $(this).data('p');

  for (ward in v) {
    if (typeof v[ward][race] !== 'undefined' && typeof v[ward][race][candidateId] !== 'undefined') {
      var wd = v[ward][race][candidateId][0];
      content += '       <table><tr>';
      content += '        <td>Ward ' + ward + '</td>';
      content += '        <td class="right">' + wd.votes + '</td>';
      content += '      </tr>';
      content += '      <tr>';
      content += '        <td class="cand-votes party-' + (partyStyle(party) === 'ind' ? partyStyle(candidateParty) : partyStyle(party)) + '" colspan="2">';
      content += '          <div class="chart">';
      content += '            <div style="width: ' + wd.perc + '%">';
      content += '              ' + (wd.perc > 15 ? wd.perc + '%' : '&nbsp;');
      content += '            </div>';
      content += '            <span style="left: ' + (wd.perc < 3 ? 3.5 : wd.perc + .5) + '%;">';
      content += '              ' + (wd.perc <= 15 ? wd.perc + '%' : '');
      content += '            </span>';
      content += '          </div>';
      content += '          <div class="all-cands" data-r="' + race + '" data-w="' + ward + '" >show other candidates...</div>';
      content += '        </td>';
      content += '      </tr></table>';
    }
  }
  $contentEl.html(content);
  $titleEl.html(c[candidateId] + ' by Ward<br>for ' + r[race]);
  $('#ward-modal').foundation('reveal', 'open');
});

$(document).on('click', 'div.all-cands', function() {
  var $contentEl = $('#cands-modal .modal-content'),
    $titleEl = $('#cands-modal h2'),
    content = '',
    race = $(this).data('r'),
    ward = $(this).data('w');

  for (var rwc in v[ward][race]) {
    var wd = v[ward][race][rwc][0];
    content += '      <table><tr>';
    content += '        <td>' + c[rwc] + '</td>';
    content += '        <td class="right">' + wd.votes + '</td>';
    content += '      </tr>';
    content += '      <tr>';
    content += '        <td class="cand-votes party-' + partyStyle(wd.party) + '" colspan="2">';
    content += '          <div class="chart">';
    content += '            <div style="width: ' + wd.perc + '%">';
    content += '              ' + (wd.perc > 15 ? wd.perc + '%' : '&nbsp;');
    content += '            </div>';
    content += '            <span style="left: ' + (wd.perc < 3 ? 3.5 : wd.perc + .5) + '%;">';
    content += '              ' + (wd.perc <= 15 ? wd.perc + '%' : '');
    content += '            </span>';
    content += '          </div>';
    content += '        </td>';
    content += '      </tr></table>';
  }
  $contentEl.html(content);
  $titleEl.html('Results in Ward ' + ward + '<br>for ' + r[race]);
  $('#cands-modal').foundation('reveal', 'open');
});
$(function() {
  $(document).foundation();
  refresh();
});