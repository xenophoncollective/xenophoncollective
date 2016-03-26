(function(d3){

  var id = function() {
    var count = 0;
    id = function() {
      return "_" + ++count;
    };
    return id();
  };

  var Node = function(name, size) {
    var n = {
      name: name,
      id: id(),
      size: size || 100
    };
    n.add = function(node) {
      this.children = this.children || [];
      this.children.push(node);
      return node;
    };
    return n;
  };

  window.Node = Node;

  var app = {};
  
  app.authLock = null;

  app.init = function(state){
    app.v.clearPage();
    app.v.createScene();
    app.v.createBrain();
    app.v.createExposition();
    app.initAuthLock();
    app.checkForHashAuthToken();
  };

  app.v = {};

  app.checkForHashAuthToken = function(){
    var hash = app.authLock.parseHash(window.location.hash);
    if (hash) {
      if (hash.error) {
        console.log("There was an error logging in", hash.error);
        alert('There was an error: ' + hash.error + '\n' + hash.error_description);
      } else {
        //save the token in the session:
        localStorage.setItem('id_token', hash.id_token);
      }
    }
  };

  app.initAuthLock = function (){
    if (app.authLock) return;
    app.authLock = new Auth0Lock('GJQkDrGVkfxX8uxONwwKnRVmNKiRJrO5', 'lukedavis.auth0.com');
  };

  app.v.clearPage = function(){
    document.body.innerHTML = '';
  };

  app.v.createScene = function(){
    d3.select("body").append("svg")
      .style("width", function(d) { return window.innerWidth; })
      .style("height", function(d) {return window.innerHeight; })
      .style("position", "absolute");
  };

  app.v.createExposition = function(){
    var effect = {effect: 'fadeInUp', shuffle: true};
    
    var title = document.createElement('h1');
    title.textContent = "Xenophon Collective";

    var subtext = document.createElement('p');
    subtext.textContent = 'technology is biology by other means';

    var email = document.createElement('p');
    email.textContent = 'inquire@xenophoncollective.com';

    document.body.appendChild(title);
    document.body.appendChild(subtext);
    document.body.appendChild(email);

    $(title).textillate({
      in: effect
    });

    $(subtext).textillate({
      in: effect
    });

    $(email).textillate({
      in: effect
    });
  };

  app.v.createSky = function(){
    var svg = d3.select("svg");
    
    var gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "sky-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#aaa")
      .attr("stop-opacity", 1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#000")
      .attr("stop-opacity", 1);
    
    svg.append("rect")
      .style("fill", "url(#sky-gradient)")
      .style("width", function(n) { return window.innerWidth;})
      .style("height", function(n){ return window.innerHeight;});
  };

  app.v.createBrain = function(){
    
    var js = Node("javascript", 300);
    var d3lib = Node("d3", 200);
    d3lib.add(Node("c3", 200));

    js.add(d3lib);
    js.add(Node("react", 200));
    js.add(Node("raphael", 250));
    js.add(Node("paper", 50));
    js.add(Node("backbone", 50));
    js.add(Node("angular", 50));
    
    var python = Node("python", 200);
    python.add(Node("django", 100));
    python.add(Node("flask", 100));
    python.add(Node("scikit-learn", 100));
    python.add(Node("beautiful soup", 50));
    python.add(Node("pandas", 50));

    var cs = Node("computer science", 200);
    cs.add(Node("big o notation"));
    
    var ds = cs.add(Node("data structures", 100));
    ds.add(Node("hash maps"));
    ds.add(Node("linked lists"));
    ds.add(Node("stacks"));
    ds.add(Node("queues"));
    ds.add(Node("trees"));
    ds.add(Node("graphs"));

    var algos = cs.add(Node("algorithms", 300));
    algos.add(Node("recursion", 50));
    algos.add(Node("sorting"));
    algos.add(Node("gradient descent"));
    algos.add(Node("fisher-yates shuffle"));
    algos.add(Node("simulated annealing", 50));

    var ml = Node("machine learning", 100);
    ml.add(Node("naive bayes classifiers", 100));
    ml.add(Node("genetic algorithms", 200));
    ml.add(Node("random forest", 75));
    ml.add(Node("simulated annealing", 50));
 
    var root = Node("all the things");
    root.add(js);
    root.add(python);
    root.add(ml);
    root.add(cs);

    root.add(Node("linux", 150));
    root.add(Node("data visualization", 300));
    root.add(Node("git", 150));
    root.add(Node("elixir", 50));
    

    var centerX = window.innerWidth * 0.5;
    var centerY = window.innerHeight * 0.5;

    var svg = d3.select('svg');
    var width = window.innerWidth;
    var height = window.innerHeight;


    var force = d3.layout.force()
      .size([width, height])
      .on("tick", tick);

    var link = svg.selectAll(".link"),
        node = svg.selectAll(".node");

    update();

    function update() {
      var nodes = flatten(root),
          links = d3.layout.tree().links(nodes);

      // Restart the force layout.
      force
        .nodes(nodes)
        .links(links)
        .linkStrength(0.05)
        .charge(-200)
        .friction(0.9)
        .gravity(0.03)
        .start();

      // Update the links…
      link = link.data(links, function(d) { return d.target.id; });

      // Exit any old links.
      link.exit().remove();

      // Enter any new links.
      link.enter().insert("line", ".node")
        .style("stroke", "#fff")
        .style("stroke-width", 0.5)
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      // Update the nodes…
      node = node.data(nodes, function(d) { return d.id; }).style("fill", color);

      // Exit any old nodes.
      node.exit().remove();

      // Enter any new nodes.
      node.enter().append("circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return Math.sqrt(d.size) || 4.5; })
        .style("fill", color)
        .style("cursor", function(d){ return d.children ? "pointer" : "arrow";})
        .on("click", click)
        .call(force.drag)
        .append("svg:title")
        .text(function(d) { return d.name; });
    }

    function tick() {
      link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    }

    // Color leaf nodes orange, and packages white or blue.
    function color(d) {
      return d._children ? "#000" : d.children ? "#fff" : "gold";
    }

    // Toggle children on click.
    function click(d) {
      if (!d3.event.defaultPrevented) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update();
      }
    }

    // Returns a list of all nodes under the root.
    function flatten(root) {
      var nodes = [], i = 0;

      function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
      }

      recurse(root);
      return nodes;
    }


  };

  window.app = app;

})(d3)
