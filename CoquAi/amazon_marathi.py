# Example with Amazon Polly (mr-IN voice)
import boto3
polly = boto3.client('polly')
response = polly.synthesize_speech(
    Text=text,
    OutputFormat='mp3',
    VoiceId='Aditi'  # Hindi/Marathi voice
)