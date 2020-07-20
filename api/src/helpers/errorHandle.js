export default function errorHandle(error, req, res, next) {
  res.status(500).send({ success: false, error: { message: error.message } });
}
