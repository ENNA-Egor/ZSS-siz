// const fs = require('fs');


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
  for (i = 0; i < elemAll.length; i++) {
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
  subjectSel.onchange = function () {
    //empty Chapters- and Topics- dropdowns
    chapterSel.length = 1;
    topicSel.length = 1;
    //display correct values
    for (var y in subjectObject[this.value]) {
      topicSel.options[topicSel.options.length] = new Option(y, y);
    }
  }
  topicSel.onchange = function () {
    //empty Chapters dropdown
    chapterSel.length = 1;
    //display correct values
    var z = subjectObject[subjectSel.value][this.value];
    for (var i = 0; i < z.length; i++) {
      chapterSel.options[chapterSel.options.length] = new Option(z[i], z[i]);
    }
  }

  var subjectSel2 = document.getElementById("subject2");
  for (var k in subjectObject) {
    subjectSel2.options[subjectSel2.options.length] = new Option(k, k);
  }
}



document.querySelector('.btn-ost').onclick = function () {
  alert('Открываем');
  const form2 = document.getElementById('form2');
  form2.reset();
};

document.querySelector('.btn-pr').onclick = function () {
  alert('Записываем');
  let dateSet = document.querySelector('.dateSet');
  let nameSiz = document.querySelector('.name_siz');
  let sizeSiz = document.querySelector('.sizeSiz');
  let rostSiz = document.querySelector('.rost');
  let quantitySiz = document.querySelector('.quantity');
  let costSiz = document.querySelector('.cost');
  // console.log( dateSet.value);
  const dataIn = {};
  dataIn.data =dateSet.value, 
  dataIn.name= nameSiz.value, 
  dataIn.size= sizeSiz.value,
  dataIn.rost= rostSiz.value,
  dataIn.quanty=quantitySiz.value,
  dataIn.cost= costSiz.value
  console.log (dataIn);

  const dataInJson =JSON.stringify(dataIn);

  console.log (dataInJson);

  // console.log(nameSiz.value, ('Размер  '+sizeSiz.value), ('Рост  '+rostSiz.value), ('Количество  '+quantitySiz.value), ('Стоимость  '+costSiz.value), ('Дата  прихода    '+dateSet.value));
  const form = document.getElementById('form1');
  form.reset();
};

IMask(document.getElementById('quantity'),{
  mask: Number,
});
// IMask(document.getElementById('cost'),{
//   mask:/^\d*(\.\d\d)?(\$|руб)/
// });

// fs.writeFile('newData.txt', dataInJson, (err)=>{
//   if (err) console.log(err);
// })