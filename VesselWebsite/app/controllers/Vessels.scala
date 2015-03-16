package controllers

import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import scala.concurrent.Future
import reactivemongo.api.Cursor
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.mvc._
import play.api.libs.json._
import models._
import models.JsonFormats._
import models.Vessel
import reactivemongo.bson.BSONDocument
import play.modules.reactivemongo.json.BSONFormats._
import scala.tools.nsc.doc.base.comment.Body
import reactivemongo.bson.BSONRegex
import reactivemongo.api.QueryOpts
import reactivemongo.core.commands._

object Vessels extends Controller with MongoController {

  case class VesselQuery(name: String = "", page: Int, numberOfItems: Int)
  implicit val vesselQueryFormat = Json.format[VesselQuery]

  def collection: JSONCollection = db.collection[JSONCollection]("vessels")
  def listVesselsPagination = Action.async(parse.json) {
    request =>

      val queryObject = request.body.as[VesselQuery]

      val query = BSONDocument("name" -> BSONRegex(".*" + queryObject.name + ".*", "i"))

      // Get count of documents matching query
      var pageCount = 0.0;
      val futureCount = db.command(Count(collection.name, Some(query)))
      futureCount.map { count =>
        pageCount = (Math.ceil(count.toFloat / queryObject.numberOfItems));
      }

      // Fetch documents by requested page      
      val cursor: Cursor[Vessel] = collection.find(query).sort(Json.obj("_id" -> -1))
        .options(QueryOpts((queryObject.page - 1) * queryObject.numberOfItems, queryObject.numberOfItems)).cursor[Vessel]
      val futureVesselsList: Future[List[Vessel]] = cursor.collect[List](queryObject.numberOfItems)
      val futureVesselsJsonArray: Future[JsArray] = futureVesselsList.map { vessels =>
        Json.arr(vessels)
      }

      futureVesselsJsonArray.map {
        vessels =>
          println(vessels)
          val jsonResponse: JsValue = JsObject(Seq(
            "count" -> JsNumber(pageCount),
            "vessels" -> vessels(0)))
          Ok(jsonResponse)
      }
  }

  def createVessel = Action.async(parse.json) {
    request =>
      request.body.validate[Vessel].map {
        vessel =>
          collection.insert(vessel).map {
            lastError =>
              Created("Vessel created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def updateVessel = Action.async(parse.json) {
    request =>
      request.body.validate[Vessel].map {
        vessel =>
          val selector = BSONDocument("_id" -> vessel._id)

          val modifier = BSONDocument(
            "$set" -> BSONDocument(
              "name" -> vessel.name,
              "width" -> vessel.width,
              "length" -> vessel.length,
              "draft" -> vessel.draft,
              "lat" -> vessel.lat,
              "long" -> vessel.long))

          collection.update(selector, modifier).map {
            lastError =>
              Ok("Vessel updated")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def removeVessel = Action.async(parse.json) {
    request =>
      println(request.body)
      request.body.validate[Vessel].map {
        vessel =>
          collection.remove(vessel).map {
            lastError =>
              Ok("Vessel removed")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }
}