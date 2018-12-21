;(function ($, window, document, undefined) {
    var pluginName = 'darDatePicker',  //自定义一个插件名称
        defaults = {                //定义插件的默认属性
          selectors: "#datePicker",
          // 动画滑入方式
          position: "right",
          max: '',
          min: '',
          length: 0,
          separator: "-",
          // 每日提示字 price(className red), lunar 阴历包含节假日提示
          dayTips: false,
          dayTipsArr: [],
          //回调函数
          callback: false
        };

    function Plugin(element, options) {
        this.element = element;     //缓存element,让原型链上的方法都可以访问

        this.options = $.extend({}, defaults, options);  //默认属性和自定义熟悉合并处理

        this._defaults = defaults;
        this._name = pluginName;

        this.init();  //插件初始化（在里面可以做dom构造，事件绑定等操作）
    }
    
    Plugin.prototype.init = function() {
      this.settings = this.options
      this.getData();
    };
    Plugin.prototype.GetDateStr=function() {
      Date.prototype.clone=function(){
        return new Date(this.valueOf());
      }
      var dd=this.checkType(this.settings.min,'date').clone();
      dd.setDate(dd.getDate()+this.options.length);//获取AddDayCount天后的日期
      var y = dd.getFullYear(); 
      var m = dd.getMonth()+1;//获取当前月份的日期
      var d = dd.getDate(); 
      return y+"-"+m+"-"+d; 
    }
    Plugin.prototype.getData = function() {
      this.settings.min ? this.min = this.checkType(this.settings.min,'date') : '';
      this.settings.max ? this.max = this.checkType(this.settings.max,'date') : this.max = this.checkType(this.GetDateStr(),'date');
      console.log(this.min)
      var json = [];
      for (var s = this.min.getFullYear(), l = this.max.getFullYear(); s <= l; s++) {
        var obj = {};
        obj['id'] = obj['name'] = s;
        obj.child = [];
        var mStart  = 1;
        if(s == this.min.getFullYear()){
          mStart = this.min.getMonth() + 1
        }else{
          mStart  = 1;
        }
        for (var m = mStart; m <= 12; m++) {
          var o = {};
          o['id'] = o['name'] = ("0" + m).slice(-2);
          o.child = [];
          var days = new Date(s, m, 0).getDate();
          var weekIndex = new Date(s, m-1, 1).getDay();
          var dStart  = 1;
          for(var i=0;i<weekIndex;i++){
            var j = {};
            j['id'] = j['name'] = ("")
            o.child.push(j);
          }
          if(s == this.min.getFullYear()&&m == mStart){
            for (var d = dStart; d <= days; d++) {
              var j = {};
              j['id'] = j['name'] = ("0" + d).slice(-2);
              if(d< this.min.getDate()){
                j['disabled'] = true;
              }
              if (!(m == this.max.getMonth() + 1 && s == this.max.getFullYear() && d > this.max.getDate())) {
                o.child.push(j);
              }
            }
          }else{
            for (var d = dStart; d <= days; d++) {
              var j = {};
              j['id'] = j['name'] = ("0" + d).slice(-2);
              if (!(m == this.max.getMonth() + 1 && s == this.max.getFullYear() && d > this.max.getDate())) {
                o.child.push(j);
              }
            }
          }  
          if (!(m > this.max.getMonth() + 1 && s == this.max.getFullYear())) {
            obj.child.push(o);
          }
        }
        json.push(obj)
      }
      this.data = json;
      this.renderHtml()
    };
    
    Plugin.prototype.renderHtml = function() {
      var items = this.data
      if (!items) {
        items = [];
      };
      var html = '<div id="datePickerPage" style="display: none;"><div class="dar-fixed"><ul><li class="dar-orange">日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li  class="dar-orange">六</li></ul></div><div class="dar-scrollBox">'
      for(var i=0;i<items.length;i++){
        html += '<div class="dar-year" yearId='+items[i].id+'><h2>'+items[i].name+'年</h2>'
        for(var j=0;j<items[i].child.length;j++){
          html += '<div monthId='+items[i].child[j].id+' border="0" class="dar-month"><h3>'+items[i].child[j].name+'月</h3><dl>'
          for(var k=0;k<items[i].child[j].child.length;k++){
            
            html+='<dd dayId='+items[i].child[j].child[k].id+'    class="'+(items[i].child[j].child[k].disabled?"dar-disable":"")+'">'+items[i].child[j].child[k].name+'</dd>'
          }
          html += '</dl></div>'
        }
        html += '</div>'
      }
      html+='</div></div>'
      $("body").prepend(html)
      var ele = $(this.element)
      var separator = this.options.separator
      ele.on('click',function(){
        $('#datePickerPage').show()
        ele.blur()
      })
      var callback = this.options.callback
      $("#datePickerPage dd").on("click",function(){
        $(this).addClass("dar-active").siblings().removeClass('dar-active')
        $("#datePickerPage").hide()
        var choice = $(this).closest('.dar-year').attr('yearId')+ separator + $(this).closest('.dar-month').attr('monthId') + separator + $(this).attr("dayId")
        ele.val(choice)
        ele.html(choice)
        callback&&callback(choice)
      })
      $("#datePickerPage .dar-disable").off()
      var now = new Date().getFullYear()
      var yearId = new Date().getFullYear()
      var monthId = ('0'+(new Date().getMonth()+1)).slice(-2)
      var dayId = ('0'+(new Date().getDate())).slice(-2)
      $("#datePickerPage .dar-year[yearId="+yearId+"]   .dar-month[monthId="+monthId+"] dd[dayId="+dayId+"]").addClass("dar-today")
    };
    Plugin.prototype.checkType = function(d, type) {
      if(type == 'date') {
        if (d instanceof Date) {
          return d
        } else {
          return new Date(d)
        }
      } else {
        if (d instanceof Date) {
          return d.getFullYear() + type + ("0" + (d.getMonth() + 1)).slice(-2) + type + ("0" + (d.getDate())).slice(-2)
        } else {
          return d
        }
      }
    };
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            //将实例化后的插件暂存，避免重复渲染
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    }
})(jQuery, window, document);