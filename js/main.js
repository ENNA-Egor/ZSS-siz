function openPage(pageName, pageName1, elmnt, color) {
    // // Hide all elements with class="tabcontent" by default */
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

  
    // // Show the specific tab content
    document.getElementById(pageName1).style.display = "block";
  
    // // Add the specific color to the button used to open the tab content
    let elem = document.querySelector(pageName);
    let elemAll = document.querySelectorAll('.tablink');
    for(i=0; i< elemAll.length; i++){
      elemAll[i].classList.remove('active');
    }
    elem.classList.add('active');
  }
  
  // Get the element with id="defaultOpen" and click on it
  document.getElementById("defaultOpen").click();

 

  var subjectObject = {
    "Летний костюм": {
      "44-46": ["170-176", "182-188"],
      "48-50": ["170-176", "182-188"],
      "52-54": ["170-176", "182-188"],
      "56-58": ["170-176", "182-188"],
      "60-62": ["170-176", "182-188"]
    },
    "Зимний костюм": {
      "44-46": ["170-176", "182-188"],
      "48-50": ["170-176", "182-188"],
      "52-54": ["170-176", "182-188"],
      "56-58": ["170-176", "182-188"],
      "60-62": ["170-176", "182-188"]
    },
    "Плащ": {
      "56-58": ["170-176", "182-188"],
      "60-62": ["170-176", "182-188"]
    }
  }
  window.onload = function setVal() {
    var subjectSel = document.getElementById("subject");
    var topicSel = document.getElementById("topic");
    var chapterSel = document.getElementById("chapter");
    for (var x in subjectObject) {
      subjectSel.options[subjectSel.options.length] = new Option(x, x);
    }
    subjectSel.onchange = function() {
      //empty Chapters- and Topics- dropdowns
      chapterSel.length = 1;
      topicSel.length = 1;
      //display correct values
      for (var y in subjectObject[this.value]) {
        topicSel.options[topicSel.options.length] = new Option(y, y);
      }
    }
    topicSel.onchange = function() {
      //empty Chapters dropdown
      chapterSel.length = 1;
      //display correct values
      var z = subjectObject[subjectSel.value][this.value];
      for (var i = 0; i < z.length; i++) {
        chapterSel.options[chapterSel.options.length] = new Option(z[i], z[i]);
      }
    }
  }
  
  // window.onload = function setVal() {
  //   var subjectSel = document.getElementById("subject2");
  //   for (var x in subjectObject) {
  //     subjectSel.options[subjectSel.options.length] = new Option(x, x);
  //   }
  // };

  document.querySelector('.btn-ost').onclick = function(){
     alert('Открываем')
    };

  document.querySelector('.btn-pr').onclick = function(){
     alert('Записываем')
    };