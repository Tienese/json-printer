# AI Conversations

{% hint style="warning" %}
**Welcome to Our New API Docs!** This is the new home for all things API (previously at [Canvas LMS REST API Documentation](https://api.instructure.com)).
{% endhint %}

## AI Conversations API

API for managing conversations with AI Experiences.

### [Get active conversation](#method.ai_conversations.active_conversation) <a href="#method.ai_conversations.active_conversation" id="method.ai_conversations.active_conversation"></a>

[AiConversationsController#active\_conversation](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_conversations_controller.rb)

**`GET /api/v1/courses/:course_id/ai_experiences/:ai_experience_id/conversations`**

**Scope:** `url:GET|/api/v1/courses/:course_id/ai_experiences/:ai_experience_id/conversations`

Get the active conversation for the current user and AI experience

### [Create AI conversation](#method.ai_conversations.create) <a href="#method.ai_conversations.create" id="method.ai_conversations.create"></a>

[AiConversationsController#create](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_conversations_controller.rb)

**`POST /api/v1/courses/:course_id/ai_experiences/:ai_experience_id/conversations`**

**Scope:** `url:POST|/api/v1/courses/:course_id/ai_experiences/:ai_experience_id/conversations`

Initialize a new conversation with the AI experience

### [Post message to conversation](#method.ai_conversations.post_message) <a href="#method.ai_conversations.post_message" id="method.ai_conversations.post_message"></a>

[AiConversationsController#post\_message](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_conversations_controller.rb)

**`POST /api/v1/courses/:course_id/ai_experiences/:ai_experience_id/conversations/:id/messages`**

**Scope:** `url:POST|/api/v1/courses/:course_id/ai_experiences/:ai_experience_id/conversations/:id/messages`

Send a message to an existing conversation and get the AI response

**Request Parameters:**

| Parameter | Type              | Description                          |
| --------- | ----------------- | ------------------------------------ |
| `message` | Required `string` | The user’s message to send to the AI |

### [Delete AI conversation](#method.ai_conversations.destroy) <a href="#method.ai_conversations.destroy" id="method.ai_conversations.destroy"></a>

[AiConversationsController#destroy](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_conversations_controller.rb)

**`DELETE /api/v1/courses/:course_id/ai_experiences/:ai_experience_id/conversations/:id`**

**Scope:** `url:DELETE|/api/v1/courses/:course_id/ai_experiences/:ai_experience_id/conversations/:id`

Mark a conversation as completed/deleted

***

This documentation is generated directly from the Canvas LMS source code, available [on Github](https://github.com/instructure/canvas-lms).
