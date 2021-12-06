#!/bin/bash

count_lines()
{
        awk 'BEGIN{lines=0} //{lines++} END{print "Total lines:", lines}' $inputFile
}

count_words()
{
	result=$(grep 'Lorem\|model\|Ipsum\|will' $inputFile)
        echo "$result"
}

add_text()
{
	echo "Enter a sentence to append to the file."
	read addTextInput
	echo "$addTextInput" >> $inputFile
}

copy()
{
	mkdir solution | cp -fr "$inputFile" solution
}

inputFile="$1"
if [ -f "$inputFile" ]; then
	echo "File $inputFile exists."
else
	echo "File $inputFile does not exist."
	exit 0
fi

while [ "$input" != 5 ]; do
	echo
	echo "Select a Menu Item: "
	echo "1. Count Lines"
	echo "2. Count Words"
	echo "3. Add Text"
	echo "4. Copy"
	echo "5. Quit"
	read input
	echo
	case "$input" in
		1)
			count_lines
			;;
		2)
			count_words
			;;
		3)
			add_text
			;;
		4)
			copy
			;;
		5)
			exit 0
			;;
		else)
			echo "Invalid Input."
	esac
done
