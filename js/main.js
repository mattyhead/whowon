var ENDPOINT = 'http://www.philadelphiavotes.com/whowon/results.json',
  INTERVAL = 45000;
  template = _.template($('#tmpl-race').html()),
// implement terrible, terrible scope cludgees, and feel much shame.
  j = 0, timeToRefresh = 0,
  v = d = p = r = c = t = city = [],
  partyStyle = {}; 

var refresh = function() {
  NProgress.start(); // show loading indicator
  
  return $.getJSON(ENDPOINT, function(data) {
    NProgress.done(); // hide loading indicator
    // Apply parsing/transformations to each candidate
    _.map(data.city['Race Results'].candidates, function(candidate) {
      candidate.percentage = parseFloat(candidate.percentage);
    });

    // data indexes
    v = data.votes;
    c = data.candidates;
    d = data.desc;
    p = data.parties;
    r = data.races;
    t = data.timestamp;

    delete data.votes['00'];

    partyStyle = function (s) {
      switch (p[s]) {
        case "DEMOCRATIC": return "dem";
        break;
        case "REPUBLICAN": return "rep";
        break;
        default: return "ind";
        break;
      }
    };

    // Clear the container
    var container = $('#main');
    container.empty();

    // For each city-level race
    [].forEach.call(data.city['Race Results'], function(race) {
      // Sort candidates by percentage
      race.candidates = _.sortBy(race.candidates, function(candidate) { return -candidate.percentage; });
      // Append the race to the container using the template

      container.append(template(race));
    });

    // Set next refresh

    timeToRefresh = INTERVAL || new Date(data.nextrun) - new Date() + 1000;
    //console.log(timeToRefresh, data.timestamp);
    window.setTimeout(refresh, timeToRefresh);
  });
};

// long delegation, since these are js-rendered elements, and because little lord baby jesus pefers long delegation
$(document).on('click', 'div.all-wards', function(){
  var selector =$('#candidate-'+$(this).data('candidate')), text=$(this).text();

  if(selector.hasClass('hidden')) {
    selector.removeClass('hidden');
    selector.hide();
  }
  selector.fadeToggle();

  $(this).text(text==='show per-ward voting detail...'?'hide per-ward voting detail...':'show per-ward voting detail...');
});

refresh();
