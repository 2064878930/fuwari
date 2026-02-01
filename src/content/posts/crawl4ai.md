---
title: Crawl4AI：面向 LLM 的开源网页抓取与数据提取指南
published: 2026-02-01
description: '从安装到实战，快速掌握 Crawl4AI 的爬取、Markdown 生成、结构化提取与 CLI 用法。'
image: ''
tags: [Python, 爬虫, LLM, AI, 开源工具]
category: '技术'
draft: false 
lang: ''
---

## 前言

如果你需要把网页内容整理成适合 RAG、智能体或数据管道使用的“干净文本”，Crawl4AI 是一个值得关注的开源爬取与抽取框架。它提供异步爬虫、Markdown 生成、结构化提取，以及一套方便的 CLI，让你从“抓页面”到“可用数据”只差几行代码。

---

## Crawl4AI 能做什么

- **异步爬取**：基于 `AsyncWebCrawler` 进行快速抓取。
- **可配置浏览器/爬取流程**：通过 `BrowserConfig` 与 `CrawlerRunConfig` 细调行为。
- **HTML → Markdown**：自动生成 Markdown，支持内容过滤与裁剪。
- **结构化提取**：CSS/XPath 或 LLM 方式抽取结构化数据。
- **CLI 一键运行**：`crwl` 命令行快速抓取与导出。

---

## 安装

### 1) 基础安装（推荐）

```bash
pip install crawl4ai
playwright install
```

### 2) 可选增强功能

```bash
# 高级聚类（PyTorch）
pip install crawl4ai[torch]

# Transformers / Hugging Face 相关
pip install crawl4ai[transformer]

# 全量功能
pip install crawl4ai[all]
```

如果安装了 `torch/transformer/all`，可选执行一次模型下载：

```bash
crawl4ai-download-models
```

---

## 快速上手：抓取并输出 Markdown

```python
import asyncio
from crawl4ai import AsyncWebCrawler

async def main():
	async with AsyncWebCrawler() as crawler:
		result = await crawler.arun("https://example.com")
		print(result.markdown[:300])

if __name__ == "__main__":
	asyncio.run(main())
```

---

## 基本配置：BrowserConfig / CrawlerRunConfig

```python
import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

async def main():
	browser_conf = BrowserConfig(headless=True)
	run_conf = CrawlerRunConfig(cache_mode=CacheMode.BYPASS)

	async with AsyncWebCrawler(config=browser_conf) as crawler:
		result = await crawler.arun(
			url="https://example.com",
			config=run_conf,
		)
		print(result.markdown)

if __name__ == "__main__":
	asyncio.run(main())
```

> 提示：如果想开启缓存，将 `CacheMode.BYPASS` 改为 `CacheMode.ENABLED`。

---

## Markdown 生成与内容裁剪

使用 `DefaultMarkdownGenerator` + `PruningContentFilter` 可以得到更“干净”的正文：

```python
import asyncio
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai.content_filter_strategy import PruningContentFilter
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

md_generator = DefaultMarkdownGenerator(
	content_filter=PruningContentFilter(threshold=0.4, threshold_type="fixed")
)

config = CrawlerRunConfig(
	cache_mode=CacheMode.BYPASS,
	markdown_generator=md_generator,
)

async def main():
	async with AsyncWebCrawler() as crawler:
		result = await crawler.arun("https://news.ycombinator.com", config=config)
		print("Raw:", len(result.markdown.raw_markdown))
		print("Fit:", len(result.markdown.fit_markdown))

if __name__ == "__main__":
	asyncio.run(main())
```

---

## 结构化提取：JsonCssExtractionStrategy

适合结构清晰的列表页、商品页等：

```python
import asyncio
import json
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai import JsonCssExtractionStrategy

schema = {
	"name": "Example Items",
	"baseSelector": "div.item",
	"fields": [
		{"name": "title", "selector": "h2", "type": "text"},
		{"name": "link", "selector": "a", "type": "attribute", "attribute": "href"},
	],
}

raw_html = "<div class='item'><h2>Item 1</h2><a href='https://example.com/item1'>Link 1</a></div>"

async def main():
	async with AsyncWebCrawler() as crawler:
		result = await crawler.arun(
			url="raw://" + raw_html,
			config=CrawlerRunConfig(
				cache_mode=CacheMode.BYPASS,
				extraction_strategy=JsonCssExtractionStrategy(schema),
			),
		)
		data = json.loads(result.extracted_content)
		print(data)

if __name__ == "__main__":
	asyncio.run(main())
```

---

## CLI 用法（crwl）

```bash
# 基础抓取
crwl https://example.com

# 输出 Markdown
crwl https://example.com -o markdown

# JSON 输出 + 关闭缓存
crwl https://example.com -o json -v --bypass-cache

# 使用配置文件
crwl https://example.com -B browser.yml -C crawler.yml

# 提问式抽取
crwl https://example.com -q "这篇文章的核心观点是什么？"

# 更多示例
crwl --example
```

---

## 适合哪些场景？

- 构建 RAG 知识库、自动化文档抓取
- 监控新闻/公告/博客更新
- 批量提取列表页结构化数据（商品、招聘、论文等）
- 结合 LLM 做复杂页面内容理解

---

## 使用建议

- 尊重网站 robots 协议与服务条款，合理控制频率。
- 动态页面建议适当延迟或启用完整渲染。
- 结构化数据优先用 CSS/XPath；复杂页面再考虑 LLM 抽取。
- 对重复抓取任务开启缓存以节省成本。

---

## 参考链接

- 官方文档：https://docs.crawl4ai.com/
- 安装指南：https://docs.crawl4ai.com/basic/installation/
- 快速上手：https://docs.crawl4ai.com/core/quickstart/
- CLI 指南：https://docs.crawl4ai.com/core/cli/
- GitHub：https://github.com/unclecode/crawl4ai
