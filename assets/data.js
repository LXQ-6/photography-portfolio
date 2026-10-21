/* ============================================================
   拾光影集 · 照片数据配置
   ------------------------------------------------------------
   ▸ 添加自己的作品：
     1. 把照片放进 photos/ 文件夹（支持 jpg / png / webp 等）
     2. 在下面 photos 数组里照格式加一条
     3. 刷新页面即可，无需改任何其他代码

   ▸ 字段说明：
     src       照片路径（列表、灯箱与"下载原图"均直接加载此文件，
               全程无缩略图、无压缩）
     title     作品标题
     en        可选英文标题，显示在中文标题下方
     category  分类（筛选按钮按出现过的分类自动生成）
     place     可选拍摄地点，显示在信息行
     ar        可选画幅 "16/10"（横幅默认）/ "4/5"（竖幅）
     desc      可选一句话描述
     exif      可选，展示在信息行与灯箱

   ▸ 未来升级后端：把这份 JSON 换成接口返回值即可（结构保持一致，
     并将 gallery.js 顶部 window.GALLERY_USE_API 设为 true）。
   ============================================================ */

window.GALLERY_DATA = {
  site: {
    title: "拾光影集",
    description: "用快门收藏时间——山野、街巷与人间的光。",

    /* 全屏封面配置 */
    hero: {
      src: "photos/01-dawn-ridges.jpg",   // 换成你想当封面的照片
      enShort: "GALLERY",                 // 导航 logo 旁的英文小字
      line: "快门按下的那一刻\n便是永恒",       // 诗意主标题，\n 换行
      en: "PHOTOGRAPHY PORTFOLIO",        // 主标题下的英文行
      bio: "时间停止本是神迹，而摄影却让凡人得以掌握这般神技。"
    },

    /* 引言区：lead 里 <i></i> 包住的文字会显示为主题金色 */
    statement: {
      lead: "时间的流动不可逆，但照片却能留下<i>时光的一角</i>。当你攀上一座高峰，拍下一张属于自己的照片，许多年过后，每当拿起那张照片，都像是重新站回了那座山上。"
    }
  },

  photos: [
    {
      src: "photos/01-dawn-ridges.jpg",
      title: "山脊晨雾",
      en: "Dawn Ridges",
      category: "风光",
      place: "川西",
      ar: "16/10",
      desc: "层叠的山脊在晨雾里依次亮起，光从最远的一层开始往外走，等风把雾拉开一道口子。",
      exif: { camera: "Sony A7R IV", lens: "24-70mm f/2.8", focal: "45mm", aperture: "f/8", shutter: "1/125s", iso: "100", date: "2026-05" }
    },
    {
      src: "photos/02-neon-alley.jpg",
      title: "雨夜霓虹",
      en: "Neon in the Rain",
      category: "城市",
      place: "上海",
      ar: "4/5",
      desc: "湿漉漉的路面把霓虹接住再反射回去，雨夜的城市因此在地面多出一片天空。",
      exif: { camera: "Fujifilm X-T5", lens: "23mm f/1.4", focal: "23mm", aperture: "f/1.8", shutter: "1/60s", iso: "1600", date: "2026-03" }
    },
    {
      src: "photos/03-lone-tree.jpg",
      title: "雾中孤树",
      en: "A Lone Tree",
      category: "风光",
      place: "坝上",
      ar: "16/10",
      desc: "大雾把所有多余的东西都收走，只剩一棵树和它脚下的草。",
      exif: { camera: "Leica Q2", lens: "28mm f/1.7", focal: "28mm", aperture: "f/5.6", shutter: "1/250s", iso: "200", date: "2025-11" }
    },
    {
      src: "photos/04-ocean-still.jpg",
      title: "海之静默",
      en: "Still Sea",
      category: "风光",
      place: "东极岛",
      ar: "16/10",
      desc: "三十秒长曝把浪抹平成雾，礁石因此显出它的沉默。",
      exif: { camera: "Canon R5", lens: "16-35mm f/4", focal: "24mm", aperture: "f/11", shutter: "30s", iso: "50", date: "2026-01" }
    },
    {
      src: "photos/05-autumn-path.jpg",
      title: "秋径",
      en: "Autumn Path",
      category: "风光",
      place: "婺源",
      ar: "4/5",
      desc: "阳光穿过雾气和树冠落在落叶上，秋天最好的一段路在光里。",
      exif: { camera: "Nikon Z7 II", lens: "50mm f/1.8", focal: "50mm", aperture: "f/2.8", shutter: "1/200s", iso: "400", date: "2025-10" }
    },
    {
      src: "photos/06-desert-dunes.jpg",
      title: "沙纹",
      en: "Dune Lines",
      category: "风光",
      place: "敦煌",
      ar: "16/10",
      desc: "低角度的光把每一道沙脊都描了一遍，曲线是风写下的手稿。",
      exif: { camera: "Sony A7R IV", lens: "70-200mm f/4", focal: "135mm", aperture: "f/9", shutter: "1/500s", iso: "100", date: "2026-02" }
    },
    {
      src: "photos/07-golden-portrait.jpg",
      title: "逆光",
      en: "Against the Light",
      category: "人像",
      place: "大理",
      ar: "4/5",
      desc: "不补光，只借日落前最后一刻的逆光，让轮廓自己发亮。",
      exif: { camera: "Canon R6 II", lens: "85mm f/1.2", focal: "85mm", aperture: "f/1.6", shutter: "1/800s", iso: "200", date: "2026-04" }
    },
    {
      src: "photos/08-blue-hour-city.jpg",
      title: "蓝调时刻",
      en: "Blue Hour",
      category: "城市",
      place: "上海",
      ar: "16/10",
      desc: "日落之后华灯未满的十分钟，天与楼在同一块蓝色里交换颜色。",
      exif: { camera: "Fujifilm GFX 100S", lens: "32-64mm f/4", focal: "45mm", aperture: "f/8", shutter: "8s", iso: "100", date: "2025-12" }
    },
    {
      src: "photos/09-old-alley.jpg",
      title: "巷口单车",
      en: "The Old Alley",
      category: "人文",
      place: "泉州",
      ar: "4/5",
      desc: "老巷、砖墙与一辆旧单车，下午的光把日常切成一帧安静的样子。",
      exif: { camera: "Nikon FM2 + Portra 400", lens: "35mm f/2", focal: "35mm", aperture: "f/2.8", shutter: "1/250s", iso: "400", date: "2025-09" }
    }
  ]
};
