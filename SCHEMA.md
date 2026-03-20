# 灵芽（ThoughtSeed）数据结构草案

## 1. ideas
- id
- user_id
- content
- source_type
- created_at
- updated_at
- favorite
- status

## 2. idea_tags
- id
- idea_id
- tag_name

## 3. idea_expansions
- id
- idea_id
- title
- summary
- problem
- audience
- value
- next_steps
- created_at

## 4. review_records
- id
- idea_id
- reviewed_at
- action
- score

## 5. relations
- id
- idea_id
- related_idea_id
- relation_type
- created_at

## 6. settings
- id
- user_id
- model_provider
- base_url
- model_name
- review_schedule
- created_at
- updated_at
