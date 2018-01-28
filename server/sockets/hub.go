// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package sockets

import (
	"bytes"
	"encoding/json"
	"log"
)

// hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Rooms
	rooms map[string]*Room

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	// Create room channel for clients.
	create chan *ClientMessage

	// Join room channel for clients.
	join chan *ClientMessage

	// Start game channel for clients.
	start chan *ClientMessage

	// Leave a channel
	leave chan *OpponentMessage

	// Channel for sending messages to a player's opponent
	attack chan *AttackMessage

	// Echo channel for clients.
	echo chan *ClientMessage
}

// channel type
type ClientMessage struct {
	client  *Client
	message []byte
}

type RoomMessage struct {
	client *Client
	room   *Room
}

func (om *RoomMessage) GetOpponent() *Client {
	if om.room.player1 == om.client {
		return om.room.player2
	} else {
		return om.room.player1
	}
}

type OpponentMessage struct {
	RoomMessage
	message []byte
}

func newOpponentMessage(client *Client, room *Room, message []byte) *OpponentMessage {
	msg := &OpponentMessage{message: message}
	msg.client = client
	msg.room = room
	return msg
}

type AttackMessage struct {
	RoomMessage
	damage int
}

func newAttackMessage(client *Client, room *Room, damage int) *AttackMessage {
	msg := &AttackMessage{damage: damage}
	msg.client = client
	msg.room = room
	return msg
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]*Room),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		create:     make(chan *ClientMessage),
		join:       make(chan *ClientMessage),
		leave:      make(chan *OpponentMessage),
		attack:     make(chan *AttackMessage),
		echo:       make(chan *ClientMessage),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true

			payload := `{"response":"pong"}`
			client.send <- []byte(payload)
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				client.LeaveRoom(true)
				delete(h.clients, client)
				close(client.send)
			}
		case cm := <-h.create:
			roomCode := h.createUniqueRoomCode()
			room := &Room{player1: cm.client}
			h.rooms[roomCode] = room
			cm.client.SetCurrentRoom(room)
			if resp, err := createMessage("ROOM_CREATED", roomCode); err == nil {
				cm.client.send <- resp
			}
		case cm := <-h.join:
			roomCode := string(cm.message)
			var resp []byte
			var err error
			if room, ok := h.rooms[roomCode]; ok {
				resp, err = createMessage("PLAYER_JOINED", "")
				if err == nil {
					room.player1.send <- resp
					room.player2 = cm.client
					cm.client.SetCurrentRoom(room)
				}
			} else {
				resp, err = createMessage("JOIN_ROOM_ERROR", "Invalid Room Code")
			}
			if err == nil {
				cm.client.send <- resp
			}
		case om := <-h.leave:
			opponent := om.GetOpponent()
			if om.message != nil {
				if _, ok := h.clients[opponent]; ok {
					opponent.send <- om.message
				}
			}
			if _, ok := h.rooms[om.room.code]; ok {
				delete(h.rooms, om.room.code)
			}
		case am := <-h.attack:
			opponent := am.GetOpponent()
			if _, ok := h.clients[opponent]; ok {
				opponent.ReceiveAttack(am.damage)
			}
		case cm := <-h.echo:

			messageDecoder := json.NewDecoder(bytes.NewReader(cm.message))
			msg := &Message{}
			if err := messageDecoder.Decode(msg); err != nil {
				log.Fatalf("Error in WS sync, server/hub.go message := <-h.broadcast() :%s", err)
				return
			}

			payload := `{"op":"ECHO_RESPONSE","payload":"` + msg.Payload + `"}`
			cm.client.send <- []byte(payload)

		}
	}
}
