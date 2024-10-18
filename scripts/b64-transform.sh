#!/bin/bash
#
# Helper script to b64 encode literal values in a k8s yaml secrets file

# Check if input file is provided
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <input-file>"
  exit 1
fi

input_file="$1"

# Process each line of the file
in_data_section=false
while IFS= read -r line; do
  # Check if the line contains "data"
  if [[ "$line" =~ ^[[:space:]]*data: ]]; then
    in_data_section=true
    echo "$line"
    continue
  fi

  # If we are in the data section, encode values
  if $in_data_section; then
    # Check if the line contains a key-value pair
    if [[ "$line" =~ ^[[:space:]]{2}[A-Za-z0-9_-]+: ]]; then
      key=$(echo "$line" | cut -d ':' -f 1 | xargs)  # Extract the key (removing extra spaces)
      value=$(echo "$line" | cut -d ':' -f 2- | xargs)  # Extract the value (removing extra spaces)

      # Base64 encode the value if it's not empty
      if [ ! -z "$value" ]; then
        encoded_value=$(echo -n "$value" | base64)
        echo "  $key: $encoded_value"
      else
        echo "$line"  # Print the line as is if value is empty
      fi
    else
      in_data_section=false  # Exit the data section if no more key-value pairs
    fi
  else
    # Print lines that are not in the data section
    echo "$line"
  fi
done < "$input_file"
