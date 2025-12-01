import json
import requests
from . import config
from .summarizer import generate_summary


def handle_summarize(building_id: str) -> dict:
    """
    Handle summarization request:
    1. Fetch comments from backend
    2. Generate summary using LLM
    3. Update summary in backend
    """
    try:
        # 1. Fetch comments from backend
        comments_url = f"{config.BACK_API_URL}/api/buildings/{building_id}/comments"
        comments_response = requests.get(comments_url, timeout=10)

        if comments_response.status_code == 404:
            return {"error": "Building not found", "status": 404}

        if not comments_response.ok:
            return {"error": f"Failed to fetch comments: {comments_response.status_code}", "status": 500}

        comments = comments_response.json()

        # 2. Generate summary
        summary_content = generate_summary(comments)

        # Calculate stats
        comment_count = len(comments)
        average_rating = 0.0
        if comment_count > 0:
            total_rating = sum(c.get("rating", 0) for c in comments)
            average_rating = round(total_rating / comment_count, 1)

        # 3. Update summary in backend
        summary_url = f"{config.BACK_API_URL}/api/summaries/{building_id}"
        summary_payload = {
            "content": summary_content,
            "averageRating": average_rating,
            "commentCount": comment_count,
        }

        update_response = requests.put(
            summary_url,
            json=summary_payload,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )

        if not update_response.ok:
            return {"error": f"Failed to update summary: {update_response.status_code}", "status": 500}

        return {"status": 200, "summary": summary_payload}

    except requests.exceptions.Timeout:
        return {"error": "Backend request timeout", "status": 504}
    except requests.exceptions.ConnectionError:
        return {"error": "Backend connection error", "status": 503}
    except Exception as e:
        print(f"Error in handle_summarize: {e}")
        return {"error": str(e), "status": 500}
