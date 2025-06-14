import os
from groq import Groq

def get_groq_response(user_message):
    from os import environ

    api_key = environ.get('GROQ_API_KEY')
    print("api_key : ",api_key)


    client = Groq(api_key=api_key)

    # Define the conversation messages
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful AI assistant specialized in creating Readme.md code in a stylish way."
            )
        },
        {"role": "user", "content": user_message}
    ]

    # API call to generate a response
    completion = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
        top_p=1,
        stream=False,  # Changed to False for simpler handling
        stop=None
    )

    return completion.choices[0].message.content
