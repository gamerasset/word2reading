#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
单词阅读理解生成器 - Web版本
"""

import os
import json
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS

# --- 初始化 Flask 应用 ---
app = Flask(__name__)
CORS(app) 

# 词典数据加载
dictionary_data = None

def load_dictionary():
    """加载词典数据"""
    global dictionary_data
    if dictionary_data is None:
        try:
            # 获取词典文件路径
            current_dir = os.path.dirname(os.path.abspath(__file__))
            dict_path = os.path.join(current_dir, '..', 'miniprogram', 'data', 'dictionary.js')
            dict_path = os.path.normpath(dict_path)
            
            with open(dict_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # 提取JSON数据
            start_marker = 'const dictionaryData = '
            start_idx = content.find(start_marker) + len(start_marker)
            
            # 找到JSON结束位置
            brace_count = 0
            end_idx = start_idx
            in_string = False
            
            for i, char in enumerate(content[start_idx:], start_idx):
                if char == '"' and (i == 0 or content[i-1] != '\\'):
                    in_string = not in_string
                elif not in_string:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i + 1
                            break
            
            json_str = content[start_idx:end_idx]
            dictionary_data = json.loads(json_str)
            print(f"词典加载成功，包含 {len(dictionary_data)} 个单词")
            
        except Exception as e:
            print(f"词典加载失败: {e}")
            dictionary_data = {}
    
    return dictionary_data

@app.route('/')
def index():
    """主页面 - 输入单词页面"""
    return render_template('index.html')

@app.route('/waiting')
def waiting():
    """等待页面"""
    return render_template('waiting.html')

@app.route('/quiz')
def quiz():
    """做题页面"""
    return render_template('quiz.html')

@app.route('/api/dictionary')
def get_dictionary():
    """获取词典数据"""
    try:
        data = load_dictionary()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/check_word', methods=['POST'])
def check_word():
    """检查单词是否在词典中"""
    if not request.is_json:
        return jsonify({"success": False, "message": "请求格式错误，需要JSON"}), 400

    data = request.get_json()
    word = data.get('word', '').strip().lower()

    if not word:
        return jsonify({"success": False, "message": "单词不能为空"}), 400

    dictionary = load_dictionary()
    
    if word in dictionary:
        word_info = dictionary[word]
        return jsonify({
            "success": True, 
            "translation": word_info.get('translation', '暂无翻译'),
            "word_info": word_info
        })
    else:
        return jsonify({
            "success": False, 
            "message": "单词不在KET/PET词汇表中"
        })


import os
from openai import OpenAI

def generate_mock_data(words):
    """生成模拟的阅读理解数据用于测试"""
    words_str = ", ".join(words)
    
    mock_data = {
        "article": f"Tom is a young student who loves learning new things. Every day, he goes to school with his friends. Today, Tom learned about {words[0]} in his English class. His teacher showed the class how to use {words[1]} in sentences. After school, Tom felt {words[2] if len(words) > 2 else 'happy'} because he understood the lesson well. He decided to practice more at home with his {words[3] if len(words) > 3 else 'books'}. Tom believes that learning English will help him {words[4] if len(words) > 4 else 'succeed'} in the future.",
        
        "questions": [
            {
                "question": "What does Tom love doing?",
                "options": {
                    "A": "Playing games",
                    "B": "Learning new things", 
                    "C": "Watching TV",
                    "D": "Sleeping"
                },
                "correct_answer": "B",
                "explanation": "文章第一句明确提到Tom loves learning new things（汤姆喜欢学习新事物）。"
            },
            {
                "question": "Where does Tom go every day?",
                "options": {
                    "A": "To the park",
                    "B": "To the library",
                    "C": "To school",
                    "D": "To the store"
                },
                "correct_answer": "C", 
                "explanation": "文章提到Every day, he goes to school with his friends（每天他和朋友们一起去学校）。"
            },
            {
                "question": f"What did Tom learn about in English class?",
                "options": {
                    "A": f"{words[0]}",
                    "B": "Mathematics",
                    "C": "History", 
                    "D": "Science"
                },
                "correct_answer": "A",
                "explanation": f"文章中提到Tom learned about {words[0]} in his English class（汤姆在英语课上学习了{words[0]}）。"
            },
            {
                "question": "How did Tom feel after school?",
                "options": {
                    "A": "Sad",
                    "B": "Angry",
                    "C": f"{words[2] if len(words) > 2 else 'Happy'}",
                    "D": "Tired"
                },
                "correct_answer": "C",
                "explanation": f"文章提到Tom felt {words[2] if len(words) > 2 else 'happy'} because he understood the lesson well（汤姆感到{words[2] if len(words) > 2 else '开心'}因为他很好地理解了课程）。"
            },
            {
                "question": "What does Tom believe about learning English?",
                "options": {
                    "A": "It's too difficult",
                    "B": "It's boring",
                    "C": "It will help him succeed in the future",
                    "D": "It's not important"
                },
                "correct_answer": "C",
                "explanation": "文章最后提到Tom believes that learning English will help him succeed in the future（汤姆相信学习英语会帮助他在未来取得成功）。"
            }
        ]
    }
    
    return mock_data

@app.route('/api/generate-reading-test', methods=['POST'])
def generate_reading_test():
    if not request.is_json:
        return jsonify({"success": False, "message": "请求格式错误，需要JSON"}), 400

    data = request.get_json()
    words = data.get('words', [])

    if not words or not (3 <= len(words) <= 5):
        return jsonify({"success": False, "message": "需要3到5个单词"}), 400

    print(f"收到生成请求，单词: {words}")
    
    try:
        print("初始化OpenAI客户端...")
        # 尝试从配置文件加载API配置
        try:
            from config import API_CONFIGS
            api_configs = API_CONFIGS
        except ImportError:
            print("⚠️  未找到config.py配置文件")
            print("请复制config_template.py为config.py并配置您的API信息")
            # 使用默认配置（需要用户手动替换）
            api_configs = [
                {
                    "base_url": "https://apis.iflow.cn/v1",  # 替换为您的API基础URL
                    "api_key": "YOUR_API_KEY",        # 替换为您的API密钥
                    "model": "qwen3-coder"        # 替换为您的模型名称
                }
            ]
        
        client = None
        model = None
        
        for config in api_configs:
            try:
                print(f"尝试API配置: {config['base_url']}")
                test_client = OpenAI(
                    base_url=config["base_url"],
                    api_key=config["api_key"],
                )
                
                # 简单测试
                test_completion = test_client.chat.completions.create(
                    model=config["model"],
                    messages=[{"role": "user", "content": "Hello"}],
                    timeout=10
                )
                
                if test_completion and test_completion.choices:
                    print(f"✓ API配置有效: {config['base_url']}")
                    client = test_client
                    model = config["model"]
                    break
                    
            except Exception as e:
                print(f"✗ API配置失败: {config['base_url']} - {e}")
                continue
        
        if not client:
            print("所有API配置都失败，使用模拟数据")
            # 返回模拟数据用于测试
            mock_data = generate_mock_data(words)
            return jsonify({
                "success": True,
                "data": mock_data,
                "message": "使用模拟数据（AI服务暂时不可用）"
            })

        # 专业的英语教材编纂提示词
        prompt = f"""# 角色
你是一位经验丰富的英语教材编纂专家，专为剑桥英语等级考试 (KET, PET, FCE) 设计阅读理解材料。

# 任务
根据我提供的5个核心词汇，生成一个完整的、难度匹配的英语阅读理解练习。

# 核心规则
1. **分析与判断**：首先，请分析我提供的5个单词的整体难度，并判断它们大致属于哪个级别 (KET/A2, PET/B1, 或 FCE/B2)。

2. **内容生成 (难度匹配)**：
   * **KET/A2 水平**: 若单词简单，创作一篇约100-120词的短文，使用基本时态和简单句，主题为日常对话或简单故事。
   * **PET/B1 水平**: 若单词为中等难度，创作一篇约180-220词的文章，运用多种时态和复合句，主题可涉及观点、经历或社会现象。
   * **FCE/B2 水平**: 若单词为较高难度，创作一篇约280-350词的深度文章，运用复杂句式、虚拟语气和高级词汇，主题可为议论性或抽象性话题。

3. **词汇整合**：必须在文章中自然、准确地使用我提供的全部5个单词。

4. **题目设计**：
   * 根据文章内容设计5个选择题（每题四选项 A, B, C, D）。
   * 题目类型应多样化，至少包含：1个主旨大意题，2个细节理解题，1个推理判断题，1个词义猜测题。

# 提供的单词
{', '.join(words)}

# 输出要求
请严格按照以下JSON格式输出：

{{
  "level": "判断的CEFR级别 (A2/B1/B2)",
  "article": "生成的英语文章",
  "questions": [
    {{
      "question": "题目内容",
      "type": "题目类型 (主旨大意/细节理解/推理判断/词义猜测/其他)",
      "options": {{
        "A": "选项A",
        "B": "选项B",
        "C": "选项C", 
        "D": "选项D"
      }},
      "correct_answer": "正确答案字母",
      "explanation": "中文解析，说明为什么选择这个答案"
    }}
  ]
}}

请确保：
- 文章自然流畅，语法正确
- 所有5个单词都在文章中出现
- 题目难度与判断的级别匹配
- 选项设计合理，干扰项有一定迷惑性
- 解析清晰易懂

只返回JSON格式，不要其他内容。"""

        print("发送请求到AI API...")
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            timeout=30
        )
        
        print("AI API响应成功")
        
        if completion and completion.choices:
            content = completion.choices[0].message.content.strip()
            print(f"AI返回内容长度: {len(content)} 字符")
            print(f"AI返回内容预览: {content[:200]}...")
            
            # 尝试解析JSON
            try:
                # 清理可能的markdown代码块标记
                if content.startswith('```json'):
                    content = content[7:]
                if content.endswith('```'):
                    content = content[:-3]
                content = content.strip()
                
                import json
                parsed_data = json.loads(content)
                print("JSON解析成功")
                
                # 验证数据结构
                if not all(key in parsed_data for key in ['article', 'questions']):
                    raise ValueError("缺少必要字段")
                
                if len(parsed_data['questions']) != 5:
                    print(f"警告: 题目数量为 {len(parsed_data['questions'])}，期望5题")
                
                print("数据验证通过，返回结构化数据")
                return jsonify({
                    "success": True, 
                    "data": parsed_data
                })
                
            except (json.JSONDecodeError, ValueError) as e:
                print(f"JSON解析失败: {e}")
                print(f"原始内容: {content}")
                # 如果解析失败，返回原始内容让前端处理
                return jsonify({
                    "success": True, 
                    "raw_content": content,
                    "message": "AI返回格式需要手动解析"
                })
        else:
            print("AI API返回为空")
            return jsonify({"success": False, "message": "AI API返回为空"}), 500

    except Exception as e:
        print(f"生成题目时发生错误: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": f"服务器错误: {str(e)}"}), 500

# --- 运行服务器 ---
if __name__ == '__main__':
    print("=" * 50)
    print("单词阅读理解生成器 - 网页版")
    print("=" * 50)
    print("🚀 启动服务器...")
    print("📍 访问地址: http://127.0.0.1:5123")
    print("🔧 页面:")
    print("   GET  / - 输入单词页面")
    print("   GET  /waiting - 等待页面")
    print("   GET  /quiz - 做题页面")
    print("🔧 API端点:")
    print("   GET  /api/dictionary - 词典数据")
    print("   POST /api/check_word - 检查单词")
    print("   POST /api/generate-reading-test - 生成题目")
    print()
    print("按 Ctrl+C 停止服务器")
    print("-" * 50)
    
    try:
        # 尝试从配置文件加载服务器配置
        try:
            from config import SERVER_HOST, SERVER_PORT, DEBUG_MODE
            host, port, debug = SERVER_HOST, SERVER_PORT, DEBUG_MODE
        except ImportError:
            host, port, debug = '127.0.0.1', 5123, True
            
        app.run(host=host, port=port, debug=debug, use_reloader=False)
    except Exception as e:
        print(f"启动失败: {e}")
        import traceback
        traceback.print_exc()

