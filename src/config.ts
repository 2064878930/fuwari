import type {
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	ExpressiveCodeConfig,
  } from './types/config'
  import { LinkPreset } from './types/config'
  
  export const siteConfig: SiteConfig = {
	title: '新之助 Blog',
	subtitle: '爱你所爱！',
  lang: 'zh_CN',         // 语言选项：'en', 'zh_CN', 'zh_TW', 'ja', 'ko'
	themeColor: {
	  hue: 260,         // 主题色的色调，取值范围 0 到 360。例如：红色: 0, 青色: 200, 蓝绿色: 250, 粉色: 345
	  fixed: false,     // 为访客隐藏主题色选择器
	},
	banner: {
	  enable: false,
	  src: 'https://i.postimg.cc/Twg2WH6X/v2-88022043e05f7ffa43711d4cab868dc2-1440w.jpg',   // 相对于 /src 目录。如果以 '/' 开头则相对于 /public 目录
	  position: 'center',      // 相当于 object-position，仅支持 'top'、'center'、'bottom'。默认为 'center'
	  credit: {
		enable: false,         // 是否显示横幅图片的署名文字
		text: '',              // 要显示的署名文字
		url: ''                // （可选）原作品或艺术家页面的链接地址
	  }
	},
	toc: {
	  enable: true,           // 启用目录功能
	  depth: 3                // 目录显示的标题层级深度 (1-3)
	},
	favicon: [    // 留空此数组以使用默认 favicon
	   {
		 src: 'https://q2.qlogo.cn/headimg_dl?dst_uin=2973517380&spec=5',    // favicon 的路径，相对于 /public 目录
		 //theme: 'light',              // （可选）'light' 或 'dark'，仅在你有不同的亮色/暗色模式 favicon 时设置
		 sizes: '128x128',              // （可选）favicon 的尺寸，仅在你有不同尺寸的 favicon 时设置
	   }
	]
  }
  
  export const navBarConfig: NavBarConfig = {
	links: [
	  LinkPreset.Home,
	  LinkPreset.Archive,
	  LinkPreset.About,
	  {
		name: 'UselessTools',
		url: 'http://tools.dl-am.cn/',     // 内部链接不应包含基础路径，因为会自动添加
		external: true,                               // 显示外部链接图标并在新标签页中打开
	  },
	],
  }
  
  export const profileConfig: ProfileConfig = {
	avatar: 'https://i.postimg.cc/Twg2WH6X/v2-88022043e05f7ffa43711d4cab868dc2-1440w.jpg',  // 相对于 /src 目录。如果以 '/' 开头则相对于 /public 目录
	name: 'Code',
	bio: '你赖东东不错嘛~',
	links: [
	  // {
		// name: 'Twitter',
		// icon: 'fa6-brands:twitter',       // 访问 https://icones.js.org/ 查看图标代码
										  // 如果尚未包含相应的图标集，你需要安装它
										  // `pnpm add @iconify-json/<图标集名称>`
		// url: 'https://twitter.com',
	  // },
	  // {
		// name: 'Steam',
		// icon: 'fa6-brands:steam',
		// url: 'https://store.steampowered.com',
	  // },
	  {
		name: 'GitHub',
		icon: 'fa6-brands:github',
		url: 'https://github.com/2064878930',
	  },
	  {
		name: 'QQ',
		icon: 'fa6-brands:qq',
		url: '#',
	  },
	  {
		name: 'Email',
		icon: 'fa6-solid:envelope',
		url: 'mailto:2064878930@qq.com',
	  },
	],
  }
  
  export const licenseConfig: LicenseConfig = {
	enable: true,
	name: 'CC BY-NC-SA 4.0',
	url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  }

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: 'github-dark',
  }