// COPIÉ depuis Flutter - Modèle produit pour prêts/emprunts
import 'package:bob/core/services/api/baseUrl.dart';
import 'package:bob/data/models/user_model.dart';

class ProductModel {
  final String? documentId;
  final int? id;
  final String? name;
  final UserModel? owner;
  final String? description;
  final bool isAvailable;
  final dynamic picture; 

  const ProductModel({
    this.id,
    this.documentId,
    this.name,
    this.owner,
    this.description,
    this.isAvailable = false,
    this.picture,
  });

  factory ProductModel.fromMap(Map<String, dynamic> map) {
    String? pic;

    if (map["picture"] != null) {
      if (map["picture"] is List) {
        pic = "${BaseUrl.currentUrl}${map["picture"].first["url"]}";
      } else {
        pic = map["picture"];
      }
    }
    return ProductModel(
      id: map["id"] != null ? map["id"] as int : null,
      documentId: map["documentId"] != null ? map["documentId"] as String : null ,
      name: map["name"] != null ? map["name"] as String : null,
      isAvailable: map["is_available"] != null ? map["is_available"] as bool : false ,
      owner: map["owner"] == null ? null : UserModel.fromMap(map["owner"]),
      description: map["description"] != null ? map["description"] as String : null ,
      picture: pic,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      "id": id,
      "documentId": documentId,
      "name": name,
      "owner": owner?.toMap(),
      "description": description,
      "isAvailable": isAvailable,
      "picture": picture,
    };
  }

  Map<String, dynamic> toDataJSON() {
    Map<String, dynamic> json = {
      "name": name,
      "is_available": isAvailable,
    };
    if (owner != null) {
      json["owner"] = owner!.documentId;
    }
    if (description != null && description!.isNotEmpty) {
      json["description"] = description;
    }
    if (picture != null && picture is int) {
      json["picture"] = picture;
    }
    return {"data": json};
  }

  ProductModel copyWith({
    int? id,
    String? documentId,
    String? name,
    UserModel? owner,
    String? description,
    dynamic picture,
    bool? isAvailable,
  }) {
    return ProductModel(
      name: name ?? this.name,
      id: id ?? this.id,
      documentId: documentId ?? this.documentId,
      owner: owner ?? this.owner,
      description: description ?? this.description,
      isAvailable: isAvailable ?? this.isAvailable,
      picture: picture ?? this.picture,
    );
  }
}

// TypeScript equivalent:
/*
export interface Product {
  documentId?: string;
  id?: number;
  name?: string;
  owner?: User;
  description?: string;
  isAvailable: boolean;
  picture?: any;
}
*/