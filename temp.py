# Input string

# Initializations
vowels = consonants = digit_sum = special_chars = 0
i = 0

vowel_set = "aeiouAEIOU"

# Using while loop to analyze each character
while i < len(user_input):
    ch = user_input[i]

    if ch.isalpha():
        if ch in vowel_set:
            vowels += 1
        else:
            consonants += 1
    elif ch.isdigit():
        digit_sum += int(ch)
    elif not ch.isspace():  # space is not counted as special
        special_chars += 1

    i += 1

# Clean the string for palindrome check (letters and digits only)
cleaned = ''.join(c.lower() for c in user_input if c.isalnum())

# Palindrome check using for loop
reversed_str = ''
for c in reversed(cleaned):
    reversed_str += c

if cleaned == reversed_str:
    palindrome_result = "✅ It **is** a palindrome!"
else:
    palindrome_result = "❌ Not a palindrome."


user_input = input("🔤 Enter a sentence or word: ")

# Final Output
print("\n🧾 Analysis Result:")
print(f"🔡 Vowels: {vowels}")
print(f"🔠 Consonants: {consonants}")
print(f"🔢 Sum of digits: {digit_sum if digit_sum > 0 else 'No digits found'}")
print(f"✨ Special characters: {special_chars}")
print(f"🔁 Palindrome Check: {palindrome_result}")
