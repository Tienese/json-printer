# AI Experiences

{% hint style="warning" %}
**Welcome to Our New API Docs!** This is the new home for all things API (previously at [Canvas LMS REST API Documentation](https://api.instructure.com)).
{% endhint %}

## AI Experiences API

API for creating, accessing and updating AI Experiences. AI Experiences are used to create interactive AI-powered learning scenarios within courses.

**An AiExperience object looks like:**

```js
// An AI Experience for interactive learning
{
  // The ID of the AI experience
  "id": 234,
  // The title for the AI experience
  "title": "Customer Service Simulation",
  // The description of the AI experience
  "description": "Practice customer service skills in a simulated environment",
  // The AI facts for the experience (optional)
  "facts": "You are a customer service representative...",
  // The learning objectives for this experience
  "learning_objective": "Students will practice active listening and problem-solving",
  // The pedagogical guidance for the experience
  "pedagogical_guidance": "A customer is calling about a billing issue",
  // The current published state of the AI experience
  "workflow_state": "published",
  // The course this experience belongs to
  "course_id": 1578941
}
```

### [List AI experiences](#method.ai_experiences.index) <a href="#method.ai_experiences.index" id="method.ai_experiences.index"></a>

[AiExperiencesController#index](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_experiences_controller.rb)

**`GET /api/v1/courses/:course_id/ai_experiences`**

**Scope:** `url:GET|/api/v1/courses/:course_id/ai_experiences`

Retrieve the paginated list of AI experiences for a course

**Request Parameters:**

| Parameter        | Type     | Description                                                                                                |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `workflow_state` | `string` | Only return experiences with the specified workflow state. Allowed values: published, unpublished, deleted |

Returns a list of [AiExperience](#aiexperience) objects.

### [Show an AI experience](#method.ai_experiences.show) <a href="#method.ai_experiences.show" id="method.ai_experiences.show"></a>

[AiExperiencesController#show](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_experiences_controller.rb)

**`GET /api/v1/courses/:course_id/ai_experiences/:id`**

**Scope:** `url:GET|/api/v1/courses/:course_id/ai_experiences/:id`

Retrieve an AI experience by ID

Returns an [AiExperience](#aiexperience) object.

### [Show new AI experience form](#method.ai_experiences.new) <a href="#method.ai_experiences.new" id="method.ai_experiences.new"></a>

[AiExperiencesController#new](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_experiences_controller.rb)

**`GET /api/v1/courses/:course_id/ai_experiences/new`**

**Scope:** `url:GET|/api/v1/courses/:course_id/ai_experiences/new`

Display the form for creating a new AI experience

### [Show edit AI experience form](#method.ai_experiences.edit) <a href="#method.ai_experiences.edit" id="method.ai_experiences.edit"></a>

[AiExperiencesController#edit](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_experiences_controller.rb)

**`GET /api/v1/courses/:course_id/ai_experiences/:id/edit`**

**Scope:** `url:GET|/api/v1/courses/:course_id/ai_experiences/:id/edit`

Display the form for editing an existing AI experience

### [Create an AI experience](#method.ai_experiences.create) <a href="#method.ai_experiences.create" id="method.ai_experiences.create"></a>

[AiExperiencesController#create](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_experiences_controller.rb)

**`POST /api/v1/courses/:course_id/ai_experiences`**

**Scope:** `url:POST|/api/v1/courses/:course_id/ai_experiences`

Create a new AI experience for the specified course

**Request Parameters:**

| Parameter              | Type              | Description                                                                                            |
| ---------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `title`                | Required `string` | The title of the AI experience.                                                                        |
| `description`          | `string`          | The description of the AI experience.                                                                  |
| `facts`                | `string`          | The AI facts for the experience.                                                                       |
| `learning_objective`   | Required `string` | The learning objectives for this experience.                                                           |
| `pedagogical_guidance` | Required `string` | The pedagogical guidance for the experience.                                                           |
| `workflow_state`       | `string`          | The initial state of the experience. Defaults to ‘unpublished’. Allowed values: published, unpublished |

Returns an [AiExperience](#aiexperience) object.

### [Update an AI experience](#method.ai_experiences.update) <a href="#method.ai_experiences.update" id="method.ai_experiences.update"></a>

[AiExperiencesController#update](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_experiences_controller.rb)

**`PUT /api/v1/courses/:course_id/ai_experiences/:id`**

**Scope:** `url:PUT|/api/v1/courses/:course_id/ai_experiences/:id`

Update an existing AI experience

**Request Parameters:**

| Parameter              | Type              | Description                                                         |
| ---------------------- | ----------------- | ------------------------------------------------------------------- |
| `title`                | `string`          | The title of the AI experience.                                     |
| `description`          | `string`          | The description of the AI experience.                               |
| `facts`                | `string`          | The AI facts for the experience.                                    |
| `learning_objective`   | Required `string` | The learning objectives for this experience.                        |
| `pedagogical_guidance` | Required `string` | The pedagogical guidance for the experience.                        |
| `workflow_state`       | `string`          | The state of the experience. Allowed values: published, unpublished |

Returns an [AiExperience](#aiexperience) object.

### [Delete an AI experience](#method.ai_experiences.destroy) <a href="#method.ai_experiences.destroy" id="method.ai_experiences.destroy"></a>

[AiExperiencesController#destroy](https://github.com/instructure/canvas-lms/blob/master/app/controllers/ai_experiences_controller.rb)

**`DELETE /api/v1/courses/:course_id/ai_experiences/:id`**

**Scope:** `url:DELETE|/api/v1/courses/:course_id/ai_experiences/:id`

Delete an AI experience (soft delete - marks as deleted)

Returns an [AiExperience](#aiexperience) object.

***

This documentation is generated directly from the Canvas LMS source code, available [on Github](https://github.com/instructure/canvas-lms).
