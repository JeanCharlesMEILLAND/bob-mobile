import 'package:bob/core/config/config.dart';
import 'package:bob/core/services/api/baseUrl.dart';
import 'package:bob/data/models/notification_model.dart';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart';

import 'package:socket_io_client/socket_io_client.dart' as so;

class SocketIoManager {
  static final SocketIoManager _instance = SocketIoManager._internal();
  final List<Map<String, Function(dynamic)>> _listeners = [];
  final List<String>  _rooms = [];
  late so.Socket _socket;

  factory SocketIoManager() {
    return _instance;
  }

  SocketIoManager._internal() {
    _connect();
  }

  List<String> getRooms() {
    return List.from(_rooms);
  }

  void _executeListener(String event, Function(dynamic) callback) {
    _socket.on(event, callback);
  }

  void _connect() {
    _socket = so.io(
      BaseUrl.socketUrl,
      so.OptionBuilder()
      .setTransports(['websocket'])
      .build(),
    );

    _socket.onConnect((_) {
      // debugPrint('✅ Connected');
      final user = AppBob.sharedPreferences?.getString(AppBob.userDocumentId)!;
      for (var listener in _listeners) {
        _executeListener(listener.keys.first, listener.values.first);
      }
      joinRoom('user.$user');
      for (var room in _rooms) {
        joinRoom(room);
      }
    });

    _socket.onDisconnect((_) {
      debugPrint('❌ Disconnected');
    });

    _socket.onError((error) {
      debugPrint('⚠️ Socket Error: $error');
    });
  }

  bobRefreshListener(Function(dynamic) callback) {
    _listeners.add({'bob.list.refresh': callback});
    _executeListener('bob.list.refresh', callback);
  }

  notificationRefreshListener(Function(dynamic) callback) {
    _listeners.add({'notification.list.refresh': callback});
    _executeListener('notification.list.refresh', callback);
  }

  bobStateListen(Function(dynamic) handler) {
    _listeners.add({'bob.state.change': handler});
    _executeListener('bob.state.change', handler);
  }

  productStateListen(Function(dynamic) handler) {
    _listeners.add({'availability.change': handler});
    _executeListener('availability.change', handler);
  }

  lendPropositionEditListen(Function(dynamic) handler) {
    _listeners.add({'lend_prop.edit': handler});
    _executeListener('lend_prop.edit', handler);
  }

  lendPropositionApprouveListen(Function(dynamic) handler) {
    _listeners.add({'lend_prop.approuve': handler});
    _executeListener('lend_prop.approuve', handler);
  }

  notificationUpdateListen(Function(dynamic) handler) {
    _listeners.add({'notification.item.update': handler});
    _executeListener('notification.item.update', handler);
  }

  void collectifRebuildListen(Function(dynamic) handler) {
    _listeners.add({'collectif.rebuild': handler});
    _executeListener('collectif.rebuild', handler);
  }

  collectifRefreshListen(Function(dynamic) handler) {
    _listeners.add({'collectif.refresh': handler});
    _executeListener('collectif.refresh', handler);
  }

  void messageSendListen(Function(dynamic) handler) {
    _listeners.add({'message.send': handler});
    _executeListener('message.send', handler);
  }

  bobChangeStatus(String bob, Map<String, dynamic> data) {
    if (_socket.connected) {
      final arg = {
        'room': bob,
        'bob': data,
      };
      _socket.emit('bob.state.change', arg);
      debugPrint('✉️ Sent $arg');
    } else {
      debugPrint('❌ Socket is not connected');
    }
  }

  Future<void> joinRoom(String roomId) async {
    // debugPrint('Connected ${_socket.connected}');
    if (_socket.connected) {
      _socket.emit('joinRoom', roomId);
      // debugPrint('🏠 Joined room: $roomId');
      if (!_rooms.contains(roomId)) {
        _rooms.add(roomId);
      }
    }
  }

  void leaveRoom(String? roomId) {
    if (roomId != null) {
      _socket.emit('leaveRoom', roomId);
      debugPrint('🚪 Left room: $roomId');
      _rooms.remove(roomId);
    }
  }

  void disconnect() {
    _socket.dispose();
    debugPrint("🔌 Socket Disconnected");
  }

  void pingBobRefresh(String id) {
    if (_socket.connected) {
      final arg = {
        'room': 'user.$id',
      };
      _socket.emit('bob.list.refresh', arg);
    } else {
      debugPrint('❌ Socket is not connected');
    }
  }

  void pingNotificationRefresh(String id, NotificationModel notif) {
    if (_socket.connected) {
      final arg = {
        'room': 'user.$id',
      };
      _socket.emit('notification.list.refresh', arg);
    } else {
      debugPrint('❌ Socket is not connected');
    }
  }

  void pingProductRefreshAvailability(String product, bool availability) {
    if (_socket.connected) {
      final arg = {
        'room': 'product.$product',
        'product': {
          'product': product,
          'availability': availability
        }
      };
      _socket.emit('availability.change', arg);
    } else {
      debugPrint('❌ Socket is not connected');
    }
  }

  void pingEditDemandePret(String lendProposition, Map<String, dynamic> data) {
        if (_socket.connected) {
      final arg = {
        'room': 'lend_prop.$lendProposition',
        'data': data
      };
      _socket.emit('lend_prop.edit', arg);
    } else {
      debugPrint('❌ Socket is not connected');
    }
  }

  void pingApprouveDemandePret(String lendProposition, Map<String, dynamic> data) {
    if (_socket.connected) {
      final arg = {
        'room': 'lend_prop.$lendProposition',
        'data': data
      };
      _socket.emit('lend_prop.approuve', arg);
    } else {
      debugPrint('❌ Socket is not connected');
    }
  }

  void pingNotificationUpdate(String id, Map<String, dynamic> data) {
    if (_socket.connected) {
      final arg = {
        'room': 'notification.$id',
        'data': data
      };
      _socket.emit('notification.item.update', arg);
    } else {
      debugPrint('❌ Socket is not connected');
    }
  }

  void pingCollectifRefresh(String id) {
    if (_socket.connected) {
      final arg = {
        'room': 'collectif.$id',
        'data': id
      };
      _socket.emit('collectif.refresh', arg);
    } else {
      debugPrint('❌ Socket is not connected');
    }
  }

  void pingCollectifRebuild(String id) {
    if (_socket.connected) {
      final arg = {
        'room': 'user.$id',
      };
      _socket.emit('collectif.rebuild', arg);
    } else {
      debugPrint('❌ Socket is not connected');
    }
  }

  void pingMessageSend(String id, Map<String, dynamic> message) {
    if (_socket.connected) {
      final arg = {
        'room': 'chat.$id',
        'message': message,
      };
      _socket.emit('message.send', arg);
      debugPrint('✉️ Message sent to chat room $id: $message');
    } else {
      debugPrint('❌ Socket is not connected, cannot send message');
    }
  }

  bool isConnected() {
    return _socket.connected;
  }

  String? id() {
    return _socket.id;
  }

  void unbind(Function(dynamic) handler) {
    _listeners.removeWhere((listener) {
      if (listener.values.first == handler) {
        final event = listener.keys.first;
        debugPrint('SOCKET UNBIND $event');
        _socket.off(event, handler);
        return true; 
      }
      return false; 
    });
  }
}