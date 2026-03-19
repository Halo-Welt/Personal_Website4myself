请分析以下留言，对它们进行聚类。留言格式为JSON数组，每个元素包含name和message字段:

{{messagesText}}

请返回JSON格式的分析结果，包含:
1. clusters: 聚类数组，每个聚类包含 category(中文类别名，简洁如"技术咨询"、"合作意向"、"赞美感谢") 和 keywords(2-3个关键词数组)
2. summary: 一句话总结这些留言的共同主题
3. wordcloud: 词云数据数组，每个元素包含text(关键词)和value(权重)

只返回JSON，不要其他内容。