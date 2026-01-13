# Model Selection Feature - User Guide

## 🎯 What's New?

Your Speech to Text application now supports **choosing from all available OpenRouter AI models** for text refinement! You're no longer limited to just one model.

---

## 🌟 Key Features

### 1. **Multiple Model Options**
- Access to **all OpenRouter models** (100+ models)
- Free and paid models available
- Different capabilities and pricing

### 2. **Easy Selection Interface**
- Visual model browser with search
- Filter by free models
- See pricing and specifications
- One-click model switching

### 3. **Model Information Display**
- Model name and description
- Context length (how much text it can handle)
- Pricing (for paid models)
- Free model indicator

### 4. **Smart Features**
- Search models by name
- Filter to show only free models
- Default model fallback
- Test your configuration

---

## 📖 How to Use

### Step 1: Open Settings

1. Click the **⚙️ Settings** icon in the top-right corner
2. You'll see two sections:
   - **Left:** API Key configuration
   - **Right:** Model Selection

### Step 2: Choose Your Model

1. **Browse Available Models:**
   - Scroll through the list of models
   - Each model shows:
     - Name and description
     - Context length
     - Pricing (if not free)
     - FREE badge for free models

2. **Search for Specific Models:**
   - Use the search box to find models by name
   - Example: Search "gemini" to find Google's models
   - Example: Search "gpt" to find OpenAI models

3. **Filter Free Models:**
   - Check "Show only free models" to see free options
   - Great for testing without costs

4. **Select a Model:**
   - Click on any model to select it
   - Selected model will be highlighted in purple
   - A checkmark appears on the right

### Step 3: Save Your Choice

1. Click **"Save Model"** button
2. You'll see: "Model preference saved! ✓"
3. Your choice is now saved

### Step 4: Test Configuration (Optional)

1. Make sure you have your API key saved
2. Click **"Test Configuration"** button
3. This tests both your API key AND selected model
4. You'll see:
   - ✓ Success: "API Key and Model are working!"
   - ✗ Error: Specific error message

---

## 🆓 Popular Free Models

Here are some popular **FREE** models you can use:

### 1. **Xiaomi MiMo V2 Flash** (Default)
- **ID:** `xiaomi/mimo-v2-flash:free`
- **Best for:** Fast, general-purpose text refinement
- **Context:** 32,768 tokens
- **Cost:** FREE

### 2. **Google Gemini Flash**
- **ID:** `google/gemini-flash-1.5`
- **Best for:** High-quality text processing
- **Context:** 1,000,000 tokens
- **Cost:** FREE tier available

### 3. **Meta Llama Models**
- Various Llama models available
- Good for general text tasks
- Different sizes and capabilities

### 4. **Mistral Models**
- Fast and efficient
- Good quality output
- Multiple versions available

---

## 💰 Understanding Pricing

### Free Models
- Marked with a green **FREE** badge
- No cost per use
- May have rate limits
- Perfect for most users

### Paid Models
- Show pricing per 1,000 tokens
- Two prices shown:
  - **Prompt:** Cost for input text
  - **Completion:** Cost for output text
- Example: "$0.001/1K" means $0.001 per 1,000 tokens
- Only charged when you use them

### Cost Example
If a model costs $0.001/1K for completion:
- 1,000 words ≈ 1,300 tokens
- Cost: ~$0.0013 per 1,000 words
- Very affordable for most use cases

---

## 🔍 Model Specifications Explained

### Context Length
- **What it is:** Maximum text the model can process at once
- **Example:** 32,768 tokens ≈ 24,000 words
- **Why it matters:** Longer context = can handle longer recordings

### Tokens
- **What it is:** Pieces of text (roughly 0.75 words per token)
- **Example:** "Hello world" = ~2 tokens
- **Why it matters:** Pricing is based on tokens

### Temperature (Fixed at 0.3)
- Controls creativity vs consistency
- Lower = more consistent, predictable
- Higher = more creative, varied
- We use 0.3 for reliable text refinement

---

## 🎨 Model Selection Interface

### What You'll See:

```
┌─────────────────────────────────────────────┐
│ AI Model Selection                          │
│                                             │
│ [Search models...]                          │
│ ☐ Show only free models                    │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Model Name                    [FREE]│   │
│ │ model-id                            │   │
│ │ Description of the model...         │   │
│ │ Context: 32,768 tokens              │ ✓ │
│ └─────────────────────────────────────┘   │
│                                             │
│ [Selected Model: Model Name]                │
│                                             │
│ [Save Model] [Reset to Default] [Test]     │
└─────────────────────────────────────────────┘
```

### Color Coding:
- **Purple highlight:** Currently selected model
- **Green badge:** Free model
- **Gray text:** Model specifications
- **Purple checkmark:** Selected indicator

---

## 🔄 Switching Models

### To Change Models:

1. **Go to Settings**
2. **Select new model** from the list
3. **Click "Save Model"**
4. **Done!** Next recording will use the new model

### To Reset to Default:

1. Click **"Reset to Default"** button
2. Returns to Xiaomi MiMo V2 Flash (free)
3. Automatically saved

### Testing After Switch:

1. Click **"Test Configuration"**
2. Verifies the new model works
3. Shows success or error message

---

## ❓ Frequently Asked Questions

### Q1: Which model should I choose?
**A:** Start with the default (Xiaomi MiMo V2 Flash). It's free and works great for most users. Try others if you want different results.

### Q2: Do I need to pay for paid models?
**A:** Only if you use them. Free models are completely free. Paid models charge per use based on OpenRouter pricing.

### Q3: Can I switch models anytime?
**A:** Yes! Change models as often as you want. Each recording can use a different model.

### Q4: Will my old recordings change?
**A:** No. Changing models only affects new recordings. Old recordings keep their original text.

### Q5: What if a model doesn't work?
**A:** Try these steps:
1. Check your API key is valid
2. Test with a free model first
3. Check OpenRouter for model availability
4. Some models may have rate limits

### Q6: How do I know which model is best?
**A:** Try a few and compare results:
- Record the same thing multiple times
- Use different models
- See which output you prefer

### Q7: Do different models give different results?
**A:** Yes! Each model has its own style:
- Some are more formal
- Some are more concise
- Some handle technical terms better
- Experiment to find your favorite

### Q8: Can I use multiple models at once?
**A:** No, but you can:
1. Record once
2. Save the result
3. Change model in Settings
4. Use "Re-refine" to try the new model

---

## 🚀 Advanced Tips

### 1. **Model Comparison**
To compare models:
1. Record something
2. Copy the raw transcription
3. Change model in Settings
4. Paste and refine with new model
5. Compare results

### 2. **Cost Optimization**
- Use free models for testing
- Switch to paid models for important recordings
- Check pricing before using paid models

### 3. **Quality vs Speed**
- Smaller models = faster, less detailed
- Larger models = slower, more detailed
- Balance based on your needs

### 4. **Context Length Matters**
- Long recordings need models with large context
- Check context length before long recordings
- Most models handle 5-10 minutes easily

---

## 🔒 Privacy & Storage

### What's Stored:
- **Selected model ID** - Saved in browser localStorage
- **API key** - Saved in browser localStorage (if you added one)

### What's NOT Stored:
- Your recordings
- Transcription results (unless you save them)
- Model list (fetched fresh each time)

### Security:
- All settings stored locally in your browser
- Nothing sent to our servers
- Only sent to OpenRouter when refining text

---

## 🎯 Quick Reference

### Default Model
- **Name:** Xiaomi MiMo V2 Flash
- **ID:** `xiaomi/mimo-v2-flash:free`
- **Cost:** FREE
- **Context:** 32,768 tokens

### How to Access
1. Click ⚙️ Settings
2. Right side = Model Selection
3. Browse, search, select
4. Save and test

### Key Buttons
- **Save Model:** Saves your choice
- **Reset to Default:** Returns to default model
- **Test Configuration:** Tests API key + model

---

## 📞 Need Help?

### If Models Won't Load:
1. Check internet connection
2. Refresh the page
3. Try again in a few minutes
4. OpenRouter API might be temporarily down

### If Test Fails:
1. Verify API key is correct
2. Try a different model
3. Check OpenRouter status
4. Ensure you have credits (for paid models)

### If Results Are Poor:
1. Try a different model
2. Check model description
3. Some models work better for certain tasks
4. Experiment with free models first

---

## 🎊 Summary

You now have access to **100+ AI models** for text refinement!

**Key Points:**
- ✅ Choose from all OpenRouter models
- ✅ Free and paid options available
- ✅ Easy search and filter
- ✅ See pricing and specifications
- ✅ Test before committing
- ✅ Switch anytime
- ✅ Default fallback included

**Get Started:**
1. Open Settings
2. Browse models
3. Select one you like
4. Save and test
5. Start recording!

---

*Enjoy exploring different AI models and finding the perfect one for your needs!* 🚀