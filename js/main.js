function formDrag(box = document.body) {

  //计算偏移量的值
  var diffObj;   
  var diffX;
  var diffY;

  //克隆的占位DIV
  var place;

  //是否点击了触发对象
  var isClick = false;
  //触发对象是否为容器内的元素
  var isIncludeBox =false;

  //移动效果的临时元素
  var itemClone;
  //触发对象的克隆元素
  var itemDown;




  //判断鼠标是否在容器里
  function isInclude(x, y,includeBox = box)   //当没有includeBox参数传进时，includeBox默认为box
  {

    y= y+document.documentElement.scrollTop;
    if (x > includeBox.offsetLeft &&
        x < includeBox.offsetLeft + includeBox.offsetWidth &&
        y > includeBox.offsetTop &&
        y < includeBox.offsetTop + includeBox.offsetHeight) 
      return true;
    return false;
  }

  //获得偏移量
  function getDiff(event,obj)
  {
    diffObj = obj;
    // console.log(diffObj);
    diffX = event.clientX - diffObj.offsetLeft;
    diffY = event.clientY - diffObj.offsetTop;
  }


  //拖动效果
  function moveMagic(moveObj,event)
  {
    //让移动效果元素虚化
    moveObj.style.opacity = 0.4;

    //在DOM中新增一个拖动的临时DIV
    moveObj.style.position = "absolute";
    document.body.appendChild(moveObj);

    //定位初始位置
    moveObj.style.left = event.clientX - diffX -10+'px';
    moveObj.style.top = event.clientY - diffY -10+'px';
  }

 
  // 克隆一个与触发对象一样大小的元素，用于临时占位
  function clonePlace(cloneObj){
    var place  = document.createElement('div');
    place.style.width = cloneObj.offsetWidth +'px';
    place.style.height = cloneObj.offsetHeight + 'px';
    place.className = 'place';

    return place;
  }


  // 鼠标按下事件
  function down(event)
  {
    // preventBubble(event);
    
    //计算容器内的子节点
    var items = box.childNodes;
    for(var i=0; i< items.length; i++)
    {
      ///判断鼠标点击是否是容器内的元素，并且不能是占位div
      if(isInclude(event.clientX,event.clientY,items[i]))
      {
        getDiff(event,items[i]);
        isClick = true;
        isIncludeBox = true;

        //克隆元素用来拖动时的效果
        itemClone = items[i].cloneNode(true);

        //克隆元素用来放下
        itemDown = items[i].cloneNode(true);

        //生成占位元素
        place = clonePlace(items[i]);

        //按下之后删除原有触发对象，并在该位置插入占位元素
        box.removeChild(items[i]);
        box.insertBefore(place,items[i]);  //不是i+1，是因为前面删掉一个节点

        // 并使用移动效果来被删除的触发元素
        moveMagic(itemClone,event);
        
        break;
      }
    }
    
  
  }

  
  //鼠标移动事件
  function move(event)
  {
    if(isClick)
    {
      moveMagic(itemClone,event);

      //判断鼠标是在容器内部
      if(isInclude(event.clientX,event.clientY))
      {
        //重新计算容器内的子节点
        var items = box.childNodes;

        //一旦进入就可以在首位置插入占位DIV(*一个小技巧)
        box.insertBefore(place,items[0]);

        //根据鼠标位置放置占位DIV
        for(var i =0; i<items.length; i++)
        {
          //占位是唯一的，只需要变动占位的位置
          if(itemClone.offsetTop >items[i].offsetTop -items[i].offsetHeight/2)
          {
            //判断是否拖动到了结尾
            if(i!=items.length-1)
              box.insertBefore(place,items[i+1])  //要加1的原因是前面插入了一个元素
            else
              box.appendChild(place);
          }
        }
      }
    }
  }

  //鼠标抬起事件
  function up(event)
  {

    //当鼠标抬起时，取消鼠标移动事件
    isClick = false;

    //鼠标抬起则可以删除临时的拖动效果元素
    if(itemClone)        //做个判断是为了防止当itemClone不存在时报错
      itemClone.remove();
      
    //如果将元素在容器内
    if(isInclude(event.clientX,event.clientY))
    {
      var items = box.childNodes;

      //找到占位div的位置
      var insertPlace;
      for(var i =0; i<items.length; i++)
      {
        if(place === items[i])     //(*小技巧)
        {
          //找到占位div的位置后，记录位置，并删除占位div
          insertPlace = i;
          box.removeChild(items[i])
          break;
        }
      }
      
      //利用所记录占位div的位置，在该位置插入克隆过的触发元素
      //判断占位div删除之前的位置是否为最后一个元素
      if(insertPlace === items.length)
        box.appendChild(itemDown);
      else
        box.insertBefore(itemDown,items[insertPlace])

    }
    isIncludeBox = false;
  }

  
    document.addEventListener('mousedown',down);
    document.addEventListener('mousemove',move);
    document.addEventListener('mouseup',up);
  
  return eventAll={
    down,
    move,
    up
  };
  
}



class FormBuilder {
  constructor(id) {
    this.main = document.querySelector(id);
    this.add = this.main.querySelector('.addField');
    this.edit = this.main.querySelector('.editField');

    this.itemsContent = this.main.querySelector('.fb-tab-content')
    this.typeBT = this.itemsContent.querySelectorAll('.fb-button');

    this.editContent = this.main.querySelector('.fb-edit')
    this.title = this.editContent.querySelector('.title')
    this.titleType = this.editContent.querySelector('.title-type');
    this.options = this.editContent.querySelector('.edit-option');
    this.opText = this.options.querySelectorAll('textarea');
    this.score = this.editContent.querySelector('.setscore');
    
    this.builderBox = document.querySelector('.fb-right');
    this.inputs = this.builderBox.querySelectorAll('.inputs');


    this.isClick = null;
    this.index = null;


    this.init();
  }
  init(){

    this.toggle();
    this.autoModify();
    this.editEnter();

    for(var i =0; i<this.typeBT.length; i++)
    {
      this.typeBT[i].addEventListener('click',this.tabToggle.bind(this,this.add,this.edit));

      if( i === 0)
        this.typeBT[i].addEventListener('click',this.singleEdit.bind(this));  
      else if(i === 1)
        this.typeBT[i].addEventListener('click',this.judgeEdit.bind(this));    
      else if(i === 2)
        this.typeBT[i].addEventListener('click',this.multEdit.bind(this));   
      else  if(i === 3)
        this.typeBT[i].addEventListener('click',this.blankEdit.bind(this));
      else  if(i === 4)
        this.typeBT[i].addEventListener('click',this.briefEdit.bind(this));
      else
        this.typeBT[i].onclick= ()=>{alert('复合题选项正在开发...')}
        
      this.typeBT[i].addEventListener('click',this.inputClick.bind(this));
      this.typeBT[i].addEventListener('click',this.getCounter.bind(this));
    }

    document.addEventListener('mouseup',this.inputClick.bind(this));
    document.addEventListener('mousemove',this.updataIndex.bind(this));
  }


  getCounter(){
    this.isClick = this.inputs.length-1;
  }

  autoModify(){
    this.title.oninput = ()=>{
      if(this.inputs[this.isClick])
      {
        var inpTitle = this.inputs[this.isClick].querySelector('.inpTitle');
        inpTitle.innerHTML =  this.title.value;
      }
      
    }
    

    for(let i=0; i<this.opText.length; i++){
      this.opText[i].oninput = ()=>{
        if(this.inputs[this.isClick]){
            var inpOption = this.inputs[this.isClick].querySelectorAll('.option');
            inpOption[i].innerHTML = this.opText[i].value;
        }
      }
    }  

    this.score.oninput = ()=>{
      if(this.inputs[this.isClick]){
        var inSCore = this.inputs[this.isClick].querySelector('.score');
        inSCore.innerHTML = '('+this.score.value+'分,'+this.titleType.innerHTML+')';
      }
    }


  }

  editEnter(){
    var enter = this.editContent.querySelector('.editEnter');
    enter.onclick = ()=>{
      this.title.value = '';
      for(var i=0;i<this.opText.length;i++)
        this.opText[i].value ='';
      this.score.value = ''
    }
  }

  toggle() {
  
    this.edit.addEventListener('click',this.tabToggle.bind(this,this.add,this.edit));
    this.add.addEventListener('click',this.tabToggle.bind(this,this.add,this.edit));

  }

  toEdit(){
    this.editContent.style.display = 'block';
    this.itemsContent.style.display = 'none';
    this.add.className = '';
    this.edit.className = 'active';
  }
  

  tabToggle(add,edit) {

    if (this.editContent.style.display === 'none') {
      this.editContent.style.display = 'block';
      this.itemsContent.style.display = 'none';
      add.className = '';
      edit.className = 'active';
    }
    else {
      this.editContent.style.display = 'none';
      this.itemsContent.style.display = 'block';
      add.className = 'active';
      edit.className = '';
    }

  }

  inputClick(){
    this.inputs = this.builderBox.querySelectorAll('.inputs');

    for(let i=0; i<this.inputs.length; i++)
    {
      var type = this.inputs[i].id;
      if(type === 'sgInput')
        this.inputs[i].addEventListener('mousedown',this.singleEdit.bind(this,i));
      else if(type === 'judInput')
        this.inputs[i].addEventListener('mousedown',this.judgeEdit.bind(this,i));
      else if(type === 'mltInput')
        this.inputs[i].addEventListener('mousedown',this.multEdit.bind(this,i));
      else if(type === 'blkInput')
        this.inputs[i].addEventListener('mousedown',this.blankEdit.bind(this,i));
      else if(type === 'befInput')
        this.inputs[i].addEventListener('mousedown',this.briefEdit.bind(this,i));
    }

    
  }

  updataIndex(){
    var index = this.builderBox.querySelectorAll('.index');
     for(var i=0; i<index.length; i++)
        index[i].innerHTML = i+1+'、';

    // if(this.inputs[this.isClick])
    // {
    //   var inSCore = this.inputs[this.isClick].querySelector('.score');
    //   inSCore.innerHTML = '('+this.score.value +'分，'+this.titleType.innerHTML+')';
    // }
    
  }

  

  singleEdit(index){
    this.toEdit()
    this.isClick = index;
    if(this.inputs[this.isClick])
    {
      this.title.value =this.inputs[this.isClick].querySelector('.inpTitle').innerHTML;
      for(let i=0; i<this.opText.length; i++){   
        var inpOption = this.inputs[this.isClick].querySelectorAll('.option');
        this.opText[i].value =inpOption[i].innerHTML;    
      }  
    }
      

    this.titleType.innerHTML = '单选题';
    this.options.style.display = 'block';

    this.updataIndex();

  }

  judgeEdit(index){
    this.toEdit()
    this.isClick = index;
    if(this.inputs[this.isClick])
      this.title.value =this.inputs[this.isClick].querySelector('.inpTitle').innerHTML;
    this.titleType.innerHTML = '判断题';
    this.options.style.display = 'none';
  }

  multEdit(index){
    this.toEdit()
    this.isClick = index;
    if(this.inputs[this.isClick])
    {
      this.title.value =this.inputs[this.isClick].querySelector('.inpTitle').innerHTML;
      for(let i=0; i<this.opText.length; i++){   
        var inpOption = this.inputs[this.isClick].querySelectorAll('.option');
        this.opText[i].value =inpOption[i].innerHTML;    
      }  

    }
    this.titleType.innerHTML = '多选题';
    this.options.style.display = 'block';
  }

  blankEdit(index){
    this.toEdit()
    this.isClick = index;
    if(this.inputs[this.isClick])
      this.title.value =this.inputs[this.isClick].querySelector('.inpTitle').innerHTML;
    this.titleType.innerHTML = '填空题';
    this.options.style.display = 'none';
  }

  briefEdit(index){
    this.toEdit()
    this.isClick = index;
    if(this.inputs[this.isClick])
      this.title.value =this.inputs[this.isClick].querySelector('.inpTitle').innerHTML;
    this.titleType.innerHTML = '简答题';
    this.options.style.display = 'none';
  }

}

// var box= document.querySelector('.fb-right');

// formDrag(box);



class Builder{
  constructor(drag,template){
    
    this.builderBox = document.querySelector('.fb-right');
    this.btSingle = document.querySelector('#single');
    this.btJudge = document.querySelector('#judge');
    this.btMultiple = document.querySelector('#multiple');
    this.btBlank = document.querySelector('#blank');
    this.btBrief = document.querySelector('#brief');
    this.delInpt = document.querySelector('.delInpt');
    this.formDrag = drag;

    this.inputs;
    this.options;
    this.opSpan;
    this.optionBox;
    this.choiceBt;
    
    this.templates = template;

    this.eventAll=this.formDrag(this.builderBox);

    this.init();
  }

  init(){
    this.btSingle.onclick = this.createItem.bind(this,0,'sgInput');
    this.btJudge.onclick = this.createItem.bind(this,1,'judInput');
    this.btMultiple.onclick = this.createItem.bind(this,0,'mltInput');
    this.btBlank.onclick = this.createItem.bind(this,2,'blkInput');
    this.btBrief.onclick = this.createItem.bind(this,2,'befInput');

    this.builderBox.addEventListener('mouseover',this.updataEvent.bind(this));
  }

  createItem(dom,type) {

    var input = document.createElement('div');
    input.className = 'inputs';
    input.id = type;

    // if( dom === 0 && magic === 0)
    //   input.id = 'sgInput';
    // else if( dom === 1 && magic ===0)
    //   input.id = 'judInput'
    // else if(dom === 0&& magic === 1)
    //   input.id = 'mltInput';
    // else if( dom === 2 && magic === -1)
    //   input.id = 'blkInput';


    this.builderBox.appendChild(input);
    input.innerHTML = this.templates[dom];

    this.inputs = document.querySelectorAll('.inputs');

    if(document.querySelector('.options'))
      this.options = document.querySelector('.options');

    if(document.querySelector('.option_Box'))
      this.optionBox = document.querySelector('.option_Box');

    

    

    var deft = input.querySelectorAll('button');
    for(var i=0; i<deft.length; i++)
    {
      // if(deft[i].id === 'mltInput')
        deft[i].isActive = false;
        // console.log(deft[i].isActive);
    }
    
    for(var i=0; i<this.inputs.length; i++)
    {
      if(this.inputs[i].id === 'sgInput' || this.inputs[i].id ==='judInput')
      {
        this.inputs[i].onmouseover = this.sigle.bind(this,this.inputs[i])
      }
        
      if(this.inputs[i].id === 'mltInput')
      {
        this.inputs[i].onmouseover = this.multiple.bind(this,this.inputs[i])
      }
        
      this.inputs[i].onmouseout = this.disBorder.bind(this.inputs[i])
    }

    
  }



  disBorder(){
    // this.style.border = "1px #fff"
    this.classList.remove("dash");
    // that.delInpt.style.display = 'none';
  }


  updataEvent(){
    var allBt = this.builderBox.querySelectorAll('button');
    for(var i=0; i<allBt.length; i++)
    {
      allBt[i].onmouseover = ()=>{

        document.removeEventListener('mousedown',this.eventAll.down);
        document.removeEventListener('mousemove',this.eventAll.move);
        document.removeEventListener('mouseup',this.eventAll.up);
      }
      allBt[i].onmouseout = ()=>{
        document.addEventListener('mousedown',this.eventAll.down);
        document.addEventListener('mousemove',this.eventAll.move);
        document.addEventListener('mouseup',this.eventAll.up);
      }
    }
    this.inputs = document.querySelectorAll('.inputs');
    for(var i=0; i<this.inputs.length; i++)
    {
      if(this.inputs[i].id === 'sgInput')
      {
        this.inputs[i].onmouseover = this.sigle.bind(this,this.inputs[i])
      }
        
      if(this.inputs[i].id === 'mltInput')
      {
        this.inputs[i].onmouseover = this.multiple.bind(this,this.inputs[i])   
      }
      else if(this.inputs[i].id === 'blkInput' ||this.inputs[i].id === 'befInput')
        this.inputs[i].onmouseover = this.addDash.bind(this.inputs[i])   
      this.inputs[i].onmouseout = this.disBorder.bind(this.inputs[i])
        
    }

  }

  sigle(that){
    // that.style.border = "1px dashed"
    that.classList.add("dash");
    if(that.querySelectorAll('button'))
      this.choiceBt = that.querySelectorAll('button');

    if(that.querySelectorAll('li'))
      this.opSpan = that.querySelectorAll('li');
    
    for(let i = 0;i<this.choiceBt.length; i++)
    {

      this.choiceBt[i].index = i; 
      this.choiceBt[i].onclick = (event)=>{

        event.cancelBubble = true;    //取消冒泡
        var isClick = i;
        for(let i = 0;i<this.choiceBt.length; i++ )
        {
          if(isClick === this.choiceBt[i].index)
          {
            this.choiceBt[i].style.color = '#fff';
            this.choiceBt[i].style.background = '#2f97f3';
            if(this.opSpan[i])
              this.opSpan[i].style.color = '#2f97f3';

          }
          else{
            this.choiceBt[i].style.color = '#333';
            this.choiceBt[i].style.background = '#f8f8f8';
            if(this.opSpan[i])
              this.opSpan[i].style.color = '#333';
          }
        }
      }
    }

  }

  multiple(that){
    that.classList.add("dash");
    this.choiceBt = that.querySelectorAll('button');
    this.opSpan = that.querySelectorAll('li');



    for(let i = 0;i<this.choiceBt.length; i++)
    {
      // this.choiceBt[i].isActive = false; 
      
      this.choiceBt[i].onclick = ()=>{

        // console.log(this.choiceBt[i].isActive);
        // if(typeof(this.choiceBt[i].isActive) === 'undefined'){
        //   this.choiceBt[i].isActive  = true;
        //   console.log(123);
        // }
          
        // console.log(this.choiceBt[i].isActive);
        
          this.choiceBt[i].isActive = !this.choiceBt[i].isActive;

        if(this.choiceBt[i].isActive === true )
          {
            this.choiceBt[i].style.color = '#fff';
            this.choiceBt[i].style.background = '#2f97f3';

            this.opSpan[i].style.color = '#2f97f3';

          }
          else
          {
            this.choiceBt[i].style.color = '#333';
            this.choiceBt[i].style.background = '#f8f8f8';

            this.opSpan[i].style.color = '#333';
          }
          
        
      }
    }

  }

  addDash(){
    this.classList.add("dash");
  }

  
} 

var template = ['<div class="single">'+
'<div class="question"> '+
'<span class="index"></span>'+
'<span class="score"></span>'+
  '<span class="inpTitle"></span>'+
'</div>'+
'<ul class="options">'+
  '<li>A、<span class="option"></span></li>'+
  '<li>B、<span class="option"></span></li>'+
  '<li>C、<span class="option"></span></li>'+
  '<li>D、<span class="option"></span></li>'+
'</ul>'+
'<div class="option_Box">'+
  '<button>A</button>'+
  '<button>B</button>'+
  '<button>C</button>'+
  '<button>D</button>'+
'</div>'+
'</div>',
'<div class="single">'+
'<div class="question"> '+
'<span class="index"></span>'+
'<span class="score"></span>'+
  '<span class="inpTitle"></span>'+
'</div>'+
'<div class="option_Box">'+
  '<button>对</button>'+
  '<button>错</button>'+
'</div>'+
'</div>',
'<div class="single">'+
    '<div class="question">'+
    '<span class="index"></span>'+
    '<span class="score"></span>'+
      '<span class="inpTitle"></span>'+
    '</div>'+
    '<textarea name="answer" class="answer" cols="30" rows="10"></textarea>'+
  '</div>'


]


new FormBuilder('.fb-left',formDrag);

new Builder(formDrag,template);






