var ENDPOINT = 'https://whowon-mattyhead.c9.io/results.json',
  INTERVAL = 30000;
  template = _.template($('#tmpl-race').html());

var refresh = function() {
  NProgress.start(); // show loading indicator
  
  return $.getJSON(ENDPOINT, function(data) {
    NProgress.done(); // hide loading indicator
    
    // Apply parsing/transformations to each candidate
    _.map(data.results.candidates, function(candidate) {
      candidate.percentage = parseFloat(candidate.percentage);
    });
    
    // Clear the container
    var container = $('#main');
    container.empty();
    
    // For each race
    data.results.forEach(function(race) {
      // Sort candidates by percentage
      race.candidates = _.sortBy(race.candidates, function(candidate) { return -candidate.percentage; });
      
      // Append the race to the container using the template
      container.append(template(race));
    });
    
    // Set next refresh
    var timeToRefresh = INTERVAL || new Date(data.nextrun) - new Date() + 1000;
    window.setTimeout(refresh, timeToRefresh);
  });
};

refresh();