from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from . import config


class Summarizer:
    def __init__(self, model_name: str | None = None):
        self.model_name = model_name or config.MODEL_NAME
        self.tokenizer = None
        self.model = None

    def load(self) -> None:
        """Load the model and tokenizer. Call this once at startup."""
        print(f"Loading model: {self.model_name}")

        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True,
        )

        print(f"Model loaded successfully")

    def generate(self, comments: list[dict]) -> str:
        """Generate a summary from a list of comments."""
        if not self.model or not self.tokenizer:
            raise RuntimeError("Model not loaded. Call load() first.")

        if not comments:
            return "No reviews available yet."

        comments_text = "\n".join([
            f"- Rating {c.get('rating', 'N/A')}/5: {c.get('content', '')}"
            for c in comments
        ])

        prompt = f"""<|user|>
Summarize the following apartment reviews in 2-3 sentences.
Focus on the main pros and cons mentioned by residents.
Be concise and objective.

Reviews:
{comments_text}
<|end|>
<|assistant|>"""

        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extract assistant response (after the last <|assistant|> tag)
        if "<|assistant|>" in response:
            response = response.split("<|assistant|>")[-1].strip()

        return response


# Singleton instance
_summarizer: Summarizer | None = None


def get_summarizer() -> Summarizer:
    """Get or create the singleton summarizer instance."""
    global _summarizer
    if _summarizer is None:
        _summarizer = Summarizer()
    return _summarizer


def generate_summary(comments: list[dict]) -> str:
    """Generate a summary from comments using the singleton summarizer."""
    summarizer = get_summarizer()
    return summarizer.generate(comments)
