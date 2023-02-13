# public-channel
A party game prototype where users communicate to agree on the same code of provided symbols while limiting information openly revealed to a group of attackers.

## How It Works
In Public Channel, three or more players use devices connected to https://public-channel.onrender.com/.

Two players are randomly assigned *Alice* and *Bob* whose goal is to collaborate to establish a shared code.

Each other player is an *Attacker* whose goal is to determine Alice and Bob's shared code.

## Gameplay
In each round, Alice and Bob are each shown four symbols from a set of symbols with a common theme (such as national flags or foods). Three of these four symbols match, but one symbol is different for each. The order of these symbols is also randomized for both Alice and Bob.

The attackers are shown the full set of 20 possible symbols that Alice and Bob may have on their devices.

Alice and Bob should then openly communicate (in front of the attackers) which shared symbol they would like to choose for the round. Alice and Bob will each select a symbol that they believe the other is selecting, while the attackers each select the symbol they believe Alice and Bob have chosen.

## Win Conditions
The game progresses for four rounds, after which either Alice and Bob or the Attackers are declared the winners.

1. If any of the symbols chosen by Alice and Bob does not agree, *the Attackers win*

2. If any of the Attackers correctly guessed the entire shared sequence of Bob and Alice, *the Attackers win*

3. If Alice and Bob created a shared sequence which none of the Attackers was able to determine, *Alice and Bob win*
